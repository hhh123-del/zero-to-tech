import os
import json
from storage import init_db,save_record, get_history
import re
import httpx
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pypinyin import lazy_pinyin, Style
from snownlp import SnowNLP
from dotenv import load_dotenv


init_db()
# 读取项目根目录 .env.local 里的 Dify 配置。
# 前端「SQL-Agent实验室」的按钮现在走 FastAPI 中转，由这里代理转发到 Dify。
load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")
DIFY_BASE_URL = os.getenv("DIFY_BASE_URL")
DIFY_API_KEY = os.getenv("DIFY_API_KEY")

HISTORY_FILE = Path(__file__).parent / "history.json"  # 固定到 backend/ 目录，跟启动目录无关



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
     allow_methods=["GET", "POST"],
    allow_headers=["*"],
)



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
def analyze(req: AnalyzeRequest):
    text = req.text
    score = round(SnowNLP(text).sentiments, 2)
    result = {
        "text": text,
        "score": score,
        "label": score_label(score),
        "pinyin": " ".join(lazy_pinyin(text, style=Style.TONE)),
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),  # ← 新增
    }
    save_record(result)                                                          # ← 存档到文件
    return result

@app.get("/api/history")
def history():
   return get_history(2)  # 切一刀：只留最近 10 条


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
    """把 Dify 返回的 answer 拆成「干净文字 + echarts 配置」。

    answer 里混了过程提示词、结果文字、```echarts{...}``` 图表配置，
    这里用正则把图表代码块抽出来，再过滤掉过程提示词，剩下干净结果。
    """
    chart = None
    text = answer or ""

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
    return "\n".join(kept).strip(), chart


class SqlRequest(BaseModel):
    prompt: str


@app.post("/api/sql-agent-lab")
async def sql_agent_lab(req: SqlRequest):
    if not DIFY_BASE_URL or not DIFY_API_KEY:
        raise HTTPException(status_code=500, detail="环境变量缺失：DIFY_BASE_URL / DIFY_API_KEY")

    payload = {
        "inputs": {},
        "query": req.prompt,
        "response_mode": "blocking",
        "user": "demo-user001",
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                f"{DIFY_BASE_URL}/chat-messages",
                headers={
                    "Authorization": f"Bearer {DIFY_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"调用 Dify 失败：{e}")

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Dify 返回 {res.status_code}")

    data = res.json()
    result_text, chart = parse_answer(data.get("answer", ""))
    return {"result": result_text, "chart": chart}
   

