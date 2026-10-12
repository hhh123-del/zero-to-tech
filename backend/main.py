import os
from dotenv import load_dotenv
import json
from storage import init_db,save_record, get_history
import re
import httpx
from datetime import datetime, timezone
from pathlib import Path

import uuid
from fastapi import FastAPI, HTTPException, Request, Response
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pypinyin import lazy_pinyin, Style
from snownlp import SnowNLP
from dotenv import load_dotenv

load_dotenv()                        # ← 读同目录下的 .env，读配置文件

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")




init_db()

ROOT_DIR = Path(__file__).resolve().parent.parent

HISTORY_FILE = Path(__file__).parent / "history.json"



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
     allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=True,
)

def get_session_id(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = uuid.uuid4().hex
        response.set_cookie(
            "session_id", session_id,
            httponly=True, samesite="lax",
            max_age=3600 * 24 * 30
        )
    return session_id

class AnalyzeRequest(BaseModel):
    text: str


def score_label(score):
    if score >= 0.6:
        return "偏积极"
    elif score <= 0.4:
        return "偏消极"
    else:
        return "中性"

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest,request: Request, response: Response):
    session_id = get_session_id(request, response)
    text = req.text
    score = round(SnowNLP(text).sentiments, 2)
    result = {
        "text": text,
        "score": score,
        "label": score_label(score),
        "pinyin": " ".join(lazy_pinyin(text, style=Style.TONE)),
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),  # ← 新增
    }
    save_record(session_id, result)                                              # ← 存档到文件
    return result

@app.get("/api/history")
def history(request: Request, response: Response, limit: int = 10):
    session_id = get_session_id(request, response)
    return get_history(session_id, limit) 
   


# Dify Agent 在回答里会夹带一些"中间步骤"提示词（如"SQL正在生成中"），
# 这些不是给用户看的结果，这里把它们从文字里剔掉。
NOISE_HINTS = [
    "SQL正在生成中",
    "格式转化中",
    "sql计算完毕",
    "模型正在汇总",
    "代码执行生成",
    "柱状图结果回复",
    "图表结果回复",
]


def parse_answer(answer: str):
    """把 Dify 返回的 answer 拆成「干净文字 + SQL语句 + echarts 配置」。

    answer 里混了过程提示词、SQL语句、结果文字、```echarts{...}``` 图表配置，
    这里用正则把SQL和图表代码块抽出来，再过滤掉过程提示词，剩下干净结果。
    """
    chart = None
    sql = None
    text = answer or ""

    # 提取SQL代码块
    sql_match = re.search(r"```sql\s*\n(.*?)```", text, re.DOTALL)
    if sql_match:
        sql = sql_match.group(1).strip()
        text = text[: sql_match.start()] + text[sql_match.end():]

    # 提取echarts图表配置
    m = re.search(r"```echarts\s*\n(.*?)```", text, re.DOTALL)
    if m:
        try:
            chart = json.loads(m.group(1).strip())
        except json.JSONDecodeError:
            chart = None
        text = text[: m.start()] + text[m.end():]

    lines = [ln.strip() for ln in text.splitlines()]
    kept = [
        ln for ln in lines
        if ln and not any(h.lower() in ln.lower() for h in NOISE_HINTS)
    ]
    return "\n".join(kept).strip(), sql, chart


class SqlRequest(BaseModel):
    prompt: str


# RFM 数据库配置
RFM_DB_PATH = Path(__file__).parent / "rfm.db"
QWEN_API_KEY = os.getenv("QWEN_API_KEY")

TABLE_SCHEMA = """
表名：user_personalized_features
字段：
- id: 用户编号
- user_id: 用户ID
- Age: 年龄
- Gender: 性别（Male/Female）
- Region: 地区（Suburban/Rural/Urban）
- Income: 收入水平
- Category: 偏好品类
- Last_Login: 最近登录天数
- Pages_Viewed: 浏览页数
- Time_Spent: 停留时长
- Total_Spending: 总消费金额
- Pref_Category: 主要消费品类
- Frequency: 购买频率
- Avg_Order: 平均订单金额
- Is_Active: 是否活跃
"""

SYSTEM_PROMPT = f"""你是一个SQL数据分析助手。根据用户的问题，生成SQL查询语句，并判断应该画什么类型的图表。

数据库表结构：
{TABLE_SCHEMA}

要求：
1. 只返回JSON格式，不要其他文字
2. 格式：{{"sql": "你的SQL语句", "chart_type": "bar/line/pie", "chart_title": "图表标题", "explanation": "简短解释"}}
3. SQL用SQLite语法
4. chart_type只能是：bar（柱状图）、line（折线图）、pie（饼图）
5. 对比类问题用bar，趋势类用line，占比类用pie

示例：
用户问：统计不同区域用户的平均消费金额
返回：{{"sql": "SELECT Region, AVG(Total_Spending) as avg_spending FROM user_personalized_features GROUP BY Region", "chart_type": "bar", "chart_title": "各区域用户平均消费金额", "explanation": "柱状图对比不同区域的平均消费"}}
"""

@app.post("/api/sql-agent-lab")
async def sql_agent_lab(req: SqlRequest):
    import sqlite3

    # 1. 调千问API生成SQL
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {QWEN_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "qwen3.8-max",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": req.prompt}
                    ],
                    "temperature": 0.1
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"调用大模型失败：{e}")

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"大模型返回错误：{res.text}")

    # 2. 解析千问返回
    data = res.json()
    answer = data["choices"][0]["message"]["content"]

    # 提取JSON（千问可能会包在```json```里）
    json_match = re.search(r"```json\s*\n(.*?)```", answer, re.DOTALL)
    if json_match:
        answer = json_match.group(1)

    try:
        llm_result = json.loads(answer)
        sql = llm_result["sql"]
        chart_type = llm_result.get("chart_type", "bar")
        chart_title = llm_result.get("chart_title", "查询结果")
        explanation = llm_result.get("explanation", "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析大模型返回失败：{e}")

    # 3. 执行SQL查询本地数据库
    try:
        conn = sqlite3.connect(RFM_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        conn.close()

        chart_data = [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SQL执行失败：{e}")

    # 4. 把查询结果转成ECharts配置
    if chart_data and len(columns) >= 2:
        cats = [row[columns[0]] for row in chart_data]
        vals = [row[columns[1]] for row in chart_data]

        if chart_type == "pie":
            chart_option = {
                "title": {"text": chart_title, "left": "center"},
                "series": [{
                    "type": "pie",
                    "radius": "60%",
                    "data": [{"name": str(c), "value": v} for c, v in zip(cats, vals)]
                }]
            }
        else:  # bar 或 line
            chart_option = {
                "title": {"text": chart_title},
                "xAxis": {"type": "category", "data": [str(c) for c in cats]},
                "yAxis": {"type": "value"},
                "series": [{"type": chart_type, "data": vals}]
            }
    else:
        chart_option = None

    # 5. 返回结果
    return {
        "result": explanation,
        "sql": sql,
        "chart": chart_option
    }
   

