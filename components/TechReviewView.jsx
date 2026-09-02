// 技术复盘页。这是一页"纯展示"的文档——没有输入框、没有发请求、没有 state，
// 所以它是服务端组件，顶上不用写 "use client"。
// 但它仍包在 <AnimatedCardGrid> 里：那是个客户端组件（要跑 anime.js 入场动画），
// 服务端组件把静态内容当作 children 交给它，卡片照样有动画。
// 记住这条规则：服务端组件可以嵌客户端组件，反过来不行。

// 为什么这页正文不放进 data/site.js？
// site.js 的"数据与界面分离"适合"同一套结构、不同文案"（比如首页标题、作品卡片）；
// 而复盘页是"文档"——正文本身就是结构（架构图、目录树、代码块），硬拆成字段反而别扭。
// 所以这里只在 site.js 放了页面元信息（标题、GitHub 地址），正文直接写在组件里。

import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import { techReviewPage } from "../data/site.js";

const SITE_JS_SNIPPET = `// data/site.js 顶部注释——"数据与界面分离"整份思想就这几句：
//   "组件只管'怎么显示'，site.js 只管'显示什么'。"
// 想改标题、加作品？只动这一个文件，组件代码一个字都不用碰。
export const home = {
  heroTitle: "关于我",
  featuredWork: {
    title: "文字实验室",
    href: "/text-lab",
  },
};`;

const PARSE_ANSWER_SNIPPET = `# 后端中转 Dify 后，answer 里混了"过程提示词"（如"SQL正在生成中"），
# 这些不是给用户看的结果，这里把它们从文字里剔掉。
NOISE_HINTS = ["SQL正在生成中", "格式转化中", "模型正在汇总"]

lines = [ln.strip() for ln in text.splitlines()]
kept = [
    ln for ln in lines
    if ln and not any(h in ln for h in NOISE_HINTS)
]`;

const PROXY_SNIPPET = `# /api/sql-agent-lab：前端不直接连 Dify，而是先到 FastAPI，再由此中转。
# 好处：API Key 留在后端，前端永远不碰密钥；前端只认识我们自己的接口。
async with httpx.AsyncClient(timeout=60) as client:
    res = await client.post(
        f"{DIFY_BASE_URL}/chat-messages",
        headers={"Authorization": f"Bearer {DIFY_API_KEY}"},
        json=payload,
    )`;

const DIR_TREE = `app/                          ← 文件夹 = 路由（Next.js 约定式路由）
  page.jsx                    ← "/"              个人主页
  text-lab/page.jsx           ← "/text-lab"      文字实验室
  sql-agent-lab/page.jsx      ← "/sql-agent-lab" SQL-Agent 实验室
components/                   ← 可复用组件（"怎么显示"）
  Nav.jsx                     ← 顶部导航（Link + usePathname）
  HomeView.jsx / TextLabView.jsx / SqlAgentLabView.jsx
  InputCard.jsx               ← 公用输入组件，两个实验室都在用
  EChartCard.jsx              ← echarts 图表渲染
css/                          ← 8 个样式文件（reset/variables/layout/hero/nav/cards/lab/responsive）
data/site.js                  ← "显示什么"：文案集中在这一份文件
backend/                      ← FastAPI 后端（"接到请求做什么"）
  main.py                     ← /api/profile · /api/analyze · /api/history · /api/sql-agent-lab
  history.json                ← 分析历史存档
  requirements.txt`;

export default function TechReviewView() {
  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav />
        <PageHeading
          title={techReviewPage.heroTitle}
          subtitle={techReviewPage.heroSubtitle}
        />
      </article>

      {/* 1. 项目定位 + GitHub + 技术栈 */}
      <article className="panel panel-full card">
        <p className="section-kicker">项目定位</p>
        <h3 className="block-title">从零到全栈的练手作品集</h3>
        <p className="block-text">
          一个个人主页 + 两个在线实验室 + 一个离线数据分析项目。
          在线的是「文字实验室」（拼音 / 情感）和「SQL-Agent 实验室」（自然语言生成 SQL），
          离线的是电商 RFM 用户分层分析（Jupyter）。三件事共用同一套前后端分离的骨架。
        </p>
        <a
          className="featured-link"
          href={techReviewPage.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="featured-link-label">
            GitHub · {techReviewPage.repo}
          </span>
          <span className="arrow">›</span>
        </a>

        <div className="stack-group">
          <h4>前端</h4>
          <div className="stack-row">
            <span className="stack-item">Next.js 15</span>
            <span className="stack-item">React 19</span>
            <span className="stack-item">anime.js（入场动画）</span>
            <span className="stack-item">ECharts（图表）</span>
          </div>
        </div>
        <div className="stack-group">
          <h4>后端</h4>
          <div className="stack-row">
            <span className="stack-item">FastAPI</span>
            <span className="stack-item">httpx（中转 Dify）</span>
            <span className="stack-item">SnowNLP（情感）</span>
            <span className="stack-item">pypinyin（拼音）</span>
          </div>
        </div>
        <div className="stack-group">
          <h4>数据 / 服务</h4>
          <div className="stack-row">
            <span className="stack-item">Dify Agent（在线 SQL 生成）</span>
            <span className="stack-item">history.json（文件存档）</span>
            <span className="stack-item">Jupyter（离线分析）</span>
          </div>
        </div>
      </article>

      {/* 2. 架构图 */}
      <article className="panel panel-full card">
        <p className="section-kicker">整体架构</p>
        <h3 className="block-title">一条请求怎么走：界面层 / 业务层 / 数据框架层</h3>
        <p className="block-text">
          前后端分离只是第一层；再往下，业务逻辑（FastAPI 接口）和"能力"（SnowNLP、pypinyin、Dify）
          也是分开的——哪天想换一个情感分析库，只改后端，前端一个字不用动。
        </p>
        <div className="arch-flow">
          <div className="arch-node">
            <strong>浏览器 / 用户</strong>
            <span>输入文字、点按钮、看结果</span>
          </div>
          <div className="arch-arrow">↓ 交互</div>
          <div className="arch-node">
            <strong>Next.js 前端 · 界面层</strong>
            <span>app/（路由）+ components/（组件）——只负责"长什么样、怎么交互"</span>
          </div>
          <div className="arch-arrow">↓ fetch /api/*</div>
          <div className="arch-node">
            <strong>FastAPI 后端 · 业务层</strong>
            <span>backend/main.py——只负责"接到请求做什么"，不碰界面</span>
          </div>
          <div className="arch-arrow">↓ 分发到</div>
          <div className="arch-branch">
            <div className="arch-node">
              <strong>SnowNLP + pypinyin</strong>
              <span>/api/analyze · 情感 + 拼音</span>
            </div>
            <div className="arch-node">
              <strong>Dify Agent</strong>
              <span>/api/sql-agent-lab · 中转</span>
            </div>
            <div className="arch-node">
              <strong>history.json</strong>
              <span>/api/history · 存档</span>
            </div>
          </div>
        </div>
      </article>

      {/* 3. 目录结构 */}
      <article className="panel panel-full card">
        <p className="section-kicker">目录结构</p>
        <h3 className="block-title">每个目录只干一件事</h3>
        <pre className="mono-block">{DIR_TREE}</pre>
      </article>

      {/* 4. 核心代码 */}
      <article className="panel panel-full card">
        <p className="section-kicker">核心代码</p>
        <h3 className="block-title">挑三个"有嚼头"的地方</h3>

        <h4 className="review-sub">4.1 数据与界面分离 —— data/site.js</h4>
        <p className="block-text">
          组件只管 <code className="inline-code">怎么显示</code>，site.js 只管{" "}
          <code className="inline-code">显示什么</code>。想改标题、加作品，只动这一个文件，组件代码一个字不用碰。
        </p>
        <pre className="mono-block">{SITE_JS_SNIPPET}</pre>

        <h4 className="review-sub">4.2 中转层为什么要"清洗" —— parse_answer()</h4>
        <p className="block-text">
          Dify Agent 的 answer 里会夹带"过程提示词"（如"SQL正在生成中"）和一段 echarts
          图表配置，这些不是给用户看的结果。后端先用正则把图表配置抽出来，再把过程提示词滤掉，
          前端拿到的就是干净文字 + 可选图表。
        </p>
        <pre className="mono-block">{PARSE_ANSWER_SNIPPET}</pre>

        <h4 className="review-sub">4.3 前端永远不碰密钥 —— 中转 Dify</h4>
        <p className="block-text">
          SQL-Agent 实验室不从前端直连 Dify，而是先发到 FastAPI、再由后端中转。
          这样 Dify 的 API Key 只存在后端{" "}
          <code className="inline-code">.env.local</code> 里，前端代码里干干净净。
        </p>
        <pre className="mono-block">{PROXY_SNIPPET}</pre>
      </article>

      {/* 5. 踩坑与取舍 */}
      <article className="panel panel-full card">
        <p className="section-kicker">踩坑与取舍</p>
        <h3 className="block-title">复盘的重点不是"做了什么"，是"踩了什么"</h3>

        <div className="pitfall">
          <strong>公用组件透传完整对象 → 页面空白</strong>
          <p>
            InputCard 是公用组件，一开始把"整份结果对象"往上透传，上层组件没解析新字段就渲染，
            页面直接白屏。教训：公用组件往上抛的数据要"最小化、约定好结构"，上层拿到字段先兜底再渲染。
          </p>
        </div>

        <div className="pitfall">
          <strong>刷新后 state 丢失</strong>
          <p>
            分析结果放在组件 state 里，一刷新就没了。这就是"前端状态"和"持久化数据"的区别：
            想要刷新还在，就得落到后端（history.json）或 localStorage，而不是只靠内存里的 state。
          </p>
        </div>

        <div className="pitfall">
          <strong>离线 Jupyter vs 在线 SQL-Agent 的边界</strong>
          <p>
            这是整个项目最有价值的一次划分：离线分析（RFM）是"一次性、可复现、要写报告"，用 Jupyter；
            在线查询（SQL-Agent）是"实时、要响应、要界面"，走接口 + Dify。
            同是"数据分析"，服务形态完全不同，不能用一个方案硬套。
          </p>
        </div>
      </article>

      {/* 6. 下一步 */}
      <article className="panel panel-full card">
        <p className="section-kicker">下一步</p>
        <h3 className="block-title">还没做完、接下来想做的</h3>
        <div className="block-text">
          <p>
            • 历史记录做分页（现在只返回最近 2 条，<code className="inline-code">records[:2]</code>{" "}
            里的数字还是随手写的）
          </p>
          <p>• 把后端地址、Dify 配置彻底收进环境变量，部署到线上</p>
          <p>• 加一层鉴权，别让 /api/sql-agent-lab 裸奔</p>
          <p>• 学习笔记模块（site.js 里 noteBlock 已经挖好了坑）</p>
        </div>
      </article>
    </AnimatedCardGrid>
  );
}
