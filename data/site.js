// 网站要显示的"内容"，全都集中在这里。
// 想改标题、改文案、加作品？只动这个文件，组件代码一个字都不用碰。
// 这就是"数据与界面分离"：组件只管"怎么显示"，site.js 只管"显示什么"。
//
// 埋了一颗模块 5 的种子：现在这些值写死在文件里；等后端登场，
// 它们可以改成从网络接口实时取——而组件那边照样一个字都不用动。

export const home = {
  heroTitle: "关于我",
  heroSubtitle: "项目，创意，灵感，心得，我的作品",
  featuredWork: {
    kicker: "作品",
    title: "文字实验室",
    copy: "拼音和情绪，挖掘中文里的细节",
    linkLabel: "打开作品",
    href: "/text-lab"
  },
  secondWork:{
    kicker:"作品",
    title:"SQL-Agent",
    copy:"自然语言查询电商RFM数据集，AI自动生成SQL，支持图表解析",
    linkLabel:"打开作品",
    href:"/sql-agent-lab"
  },
  rfmProject:{
    kicker:"数据分析项目",
    title:"电商RFM用户分层分析",
    copy:"Jupyter完成数据清洗、RFM指标计算、用户分层、假设检验，完整分析报告",
    linkLabel:"查看报告",
    href:"/report/rfm/README.html",
  },
  techReview:{
    kicker:"技术复盘",
    title:"Zero-to-Tech 站点整体架构",
    copy:"Next.js前端 /API路由/前后端交互流程/遇到问题/业务区分",
    linkLabel:"查看复盘",
    href:"/tech-review",
   
  },
  noteBlock:{
    kicker:"学习笔记",
    title:"数据分析 & 全栈 笔记",
    copy:"Excel / PowerQuery / Python / SQL 与前后端开发笔记，Markdown 渲染，支持搜索与大纲",
    linkLabel:"查看笔记",
    href:"/notes",
  },

  identity: {
    motto: "已识乾坤大，尤怜草木青",
    learning: "零到全栈",
  },
};

export const textLab = {
  heroTitle: "文字实验室",
  heroSubtitle: "拼音和情绪，挖掘中文里的细节",
};

//新增了sql页面
export const sqlAgentLab = {
  heroTitle: "SQL-Agent",
  heroSubtitle: "输入自然语言，自动生成并执行SQL查询"
};

// 技术复盘页的元信息（正文在 components/TechReviewView.jsx 里）。
// 复盘页是"文档"，正文本身就是结构（架构图、目录树、代码块），不适合拆成字段，
// 所以这里只放标题、GitHub 地址这类"元信息"。
export const techReviewPage = {
  heroTitle: "技术复盘",
  heroSubtitle: "Zero-to-Tech 站点整体架构",
  repo: "hhh123-del/zero-to-tech",
  githubUrl: "https://github.com/hhh123-del/zero-to-tech",
};