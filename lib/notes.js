// lib/notes.js —— 学习笔记的"内容层"。
// 在构建期(服务端)把 content/notes/ 下的 .md 读出来，转成三样东西：
//   1. html      —— 带标题 id 的 HTML 字符串（交给前端用 dangerouslySetInnerHTML 渲染）
//   2. headings  —— 大纲：每个标题的 { depth, text, id }
//   3. plainText —— 去掉标签的纯文本，供前端做全文搜索
//
// 为什么在构建期做、而不是前端用 react-markdown？
//   标题 id 只在这一次生成，大纲和正文锚点天然一致，前端只负责"跳转"，不会出现 id 对不上。
//   同时 markdown 解析库全部留在 node 侧，不进浏览器 bundle（本项目是 output:'export' 静态站点）。

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeStringify from "rehype-stringify";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

// markdown 里写的是 \( ... \)（行内）和 \[ ... \]（独占一段）——Typora / LaTeX 的习惯写法。
// 但 remark-math 只认 $...$ 和 $$...$$；更麻烦的是 CommonMark 会把 \( 里的反斜杠
// 当成转义符吃掉，反斜杠一消失，公式就散成 V_π(s) 这种乱码。
// 所以在解析之前，先把这两种定界符换成 remark-math 认识的形式。
// 围栏代码块和行内代码必须跳过：那里的 \( 是给人看的示例，替换掉就失真了。
// 行内公式默认按 textstyle 排（分式缩小、求和号缩成角标），在中文正文里会显得"挤"，
// 这就是分数上下不协调、上下标贴在一起的原因 —— 不是渲染出错，是 LaTeX 的行内规则。
// 判定为"高公式"时自动补一个 \displaystyle，让它按独立公式的尺寸排。
const TALL_MATH = /\\(frac|dfrac|tfrac|cfrac|sum|prod|coprod|int|iint|oint|lim|sqrt|binom|overline|underline|begin\s*\{)/;

// KaTeX 在数学模式里遇到中文标点会直接判错（unicodeTextInMathMode），
// 而且不是"那一个字符不显示"，是整条公式渲染失败、退回原始 LaTeX 文本。
// 公式里的中文标点统一换成半角符号；\text{} 里的是正文，原样保留。
const CN_PUNCT = { "，": ",", "。": ".", "；": ";", "：": ":", "、": ",", "（": "(", "）": ")" };
function fixMathPunct(tex) {
  return tex
    .split(/(\\text\{[^}]*\})/g)
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/[，。；：、（）]/g, (c) => CN_PUNCT[c])))
    .join("");
}

// \vec 的箭头是靠 Unicode 组合字符 U+20D7 叠在字母上方画的，
// 字体度量稍有差异就会落到字母下面（截图里 z、a 下方那道短横就是这么来的）。
// 向量改用粗体表示：这是机器学习教材的通行写法（Ng 的讲义、西瓜书都是粗体），
// 而且纯字体加粗，不依赖任何组合字符，任何环境位置都稳。
function fixVector(tex) {
  return tex
    .replace(/\\vec\s*\{([^{}]*)\}/g, "\\boldsymbol{$1}")
    .replace(/\\vec\s+([A-Za-z])/g, "\\boldsymbol{$1}");
}

// LaTeX 里 \alpha_k^2 的下标和上标共用一列，宽度不同就居中对齐 ——
// k 宽、2 窄，2 就压到 k 正上方糊成一团。这不是字号问题（script 已经是 0.7em），
// 继续缩小只会更糊。正确做法是给基数加一层分组：{\alpha_k}^2，
// 上标于是挂到"带下标的整体"右上角，不再和下标抢位置。
// 求和/积分这类操作符的上下限本来就要排成上下两行，必须原样保留；
// \left \right \big 这几类命令后面必须紧跟括号，加了分组就是非法 TeX，整条公式会退回原文。
const NO_GROUP = new Set([
  "sum", "prod", "coprod", "int", "iint", "iiint", "oint",
  "lim", "max", "min", "sup", "inf", "det", "gcd", "bigcup", "bigcap",
  "left", "right", "middle",
  "big", "Big", "bigg", "Bigg",
  "bigl", "bigr", "Bigl", "Bigr", "biggl", "biggr", "Biggl", "Biggr",
]);

// 基数：命令（可带一个不含嵌套的必选参数，如 \mathbf{W}）或单个字母。
// 上下标各自可以是 {…}、裸命令（_\pi）或单个字母数字。
const SCRIPT_BASE = String.raw`(\\[a-zA-Z]+(?:\{[^{}]*\})?|[A-Za-z])`;
const SCRIPT_SUB = String.raw`(_\{[^{}]*\}|_\\[a-zA-Z]+|_[A-Za-z0-9])`;
const SCRIPT_SUP = String.raw`(\^\{[^{}]*\}|\^\\[a-zA-Z]+|\^[A-Za-z0-9])`;
const SUB_THEN_SUP = new RegExp(SCRIPT_BASE + SCRIPT_SUB + SCRIPT_SUP, "g");
const SUP_THEN_SUB = new RegExp(SCRIPT_BASE + SCRIPT_SUP + SCRIPT_SUB, "g");

function regroupScripts(whole, base, first, second) {
  const cmd = /^\\([a-zA-Z]+)/.exec(base);
  if (cmd && NO_GROUP.has(cmd[1])) return whole;
  return `{${base}${first}}${second}`;
}

// _ 和 ^ 的书写先后不影响排版，两种顺序都要覆盖（w_j^2 / w^2_j）；
// 第一遍改写后的结果是 {w_j}^2，第二遍在 } 处断开，不会重复改写。
function fixScripts(tex) {
  return tex
    .replace(SUB_THEN_SUP, regroupScripts)
    .replace(SUP_THEN_SUB, regroupScripts);
}

function convertMathDelimiters(text) {
  return (
    text
      // 块级公式统一转成"行内 display 公式"，不再用 $$ 独立成行。
      //
      // 为什么不继续用 $$：笔记里绝大多数公式写在列表项内部（"* **公式**：\["），
      // 而原文缩进并不规范（\[ 缩进 4 格，公式内容却顶格）。要让它继续待在列表里，
      // $$ 的缩进必须精确等于列表项内容的缩进，差一格就变成缩进代码块 ——
      // 后面整段（"* 性质：...."）会被当成代码原样输出，公式也会退化成红色原文。
      // 这是 markdown 缩进规则决定的，靠正则猜层级永远有漏网之鱼。
      //
      // $\displaystyle ...$ 永远待在段落内部，不碰任何列表/缩进结构，
      // 同时保留块级公式的字号（分式不缩小、求和号上下限居中）。
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, body) => {
        const tex = body
          .split("\n")
          .map((line) => fixScripts(fixVector(fixMathPunct(line.trim()))))
          .filter(Boolean)
          .join(" ");
        if (!tex || /^\\displaystyle/.test(tex)) return `$${tex}$`;
        return `$\\displaystyle ${tex}$`;
      })
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, body) => {
        const tex = fixScripts(fixVector(fixMathPunct(body.trim())));
        // 已经自己写了 \displaystyle 的，别叠加。
        if (!TALL_MATH.test(tex) || /^\\displaystyle/.test(tex)) return `$${tex}$`;
        return `$\\displaystyle ${tex}$`;
      })
  );
}

function normalizeMath(markdown) {
  return (
    markdown
      // split 带捕获组：偶数下标是正文，奇数下标是 ``` 代码块，只处理正文。
      .split(/(```[\s\S]*?```)/g)
      .map((chunk, i) => {
        if (i % 2 === 1) return chunk;
        return chunk
          .split(/(`[^`\n]+`)/g)
          .map((seg, j) => (j % 2 === 1 ? seg : convertMathDelimiters(seg)))
          .join("");
      })
      .join("")
  );
}

// 把标题文字变成稳定的锚点 id：去反引号/加粗，中文和字母数字保留，其余转成连字符。
function slugify(text) {
  return text
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 从 HAST 节点里抽出纯文本（标题里可能有行内代码/加粗/链接，递归拼起来）。
function nodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    return (node.children || []).map(nodeText).join("");
  }
  return "";
}

// 自定义 rehype 插件：给每个 h1~h6 加 id，同时把 {depth,text,id} 收进 file.data.headings。
// 用去重 map 处理重名标题（如"获取元素""容器互相转换"在文里出现多次）。
function rehypeSlugHeadings() {
  const seen = new Set();
  return (tree, file) => {
    const headings = [];
    const walk = (node) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node.children)) {
        if (/^h[1-6]$/.test(node.tagName || "")) {
          const depth = Number(node.tagName[1]);
          const text = nodeText(node);
          const base = slugify(text) || "section";
          let id = base;
          let i = 2;
          while (seen.has(id)) id = `${base}-${i++}`;
          seen.add(id);
          node.properties = node.properties || {};
          node.properties.id = id;
          headings.push({ depth, text, id });
        }
        node.children.forEach(walk);
      }
    };
    walk(tree);
    file.data.headings = headings;
  };
}

async function processNote(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const source = normalizeMath(content);

  const file = await unified()
    .use(remarkParse)
    // gfm 要在 math 之前：表格单元格里的 $x$ 也得能认出来。
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlugHeadings)
    // katex 必须排在 highlight 前面：行内公式会被解析成 <code class="language-math">，
    // 先让 katex 把它替换掉，highlight 就不会去尝试"高亮 math 语言"。
    // throwOnError:false —— 某条公式写错时只把原文渲染出来，不让整个静态构建挂掉。
    //
    // macros 里的反斜杠必须写成 \\：写成 "\N" 时 JS 会把它当成无效转义吃掉，
    // 宏名就变成裸的字母 N。KaTeX 于是把每个字母 N 都展开成 mathbb{N}，
    // 而展开结果里又含 N —— 无限展开，报 "Too many expansions"，
    // 任何含 N / R / E 的公式都会整体渲染失败（这才是之前公式"乱码"的真正原因）。
    // 另外不要覆盖 "\\mathbb"：它是 KaTeX 自带的黑板体命令，
    // 覆盖成 mathbf 会让 \mathbb{E} 显示成普通粗体 E。
    .use(rehypeKatex, {
      throwOnError: false,
      strict: false,
      macros: {
        "\\R": "\\mathbb{R}",
        "\\N": "\\mathbb{N}",
        "\\E": "\\mathbb{E}",
        "\\Var": "\\mathrm{Var}",
        "\\Cov": "\\mathrm{Cov}",
      },
    })
    // 未知语言（如 powerquery）rehype-highlight 会记一条 warning 后保持纯文本，不会中断构建。
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(source);

  const html = String(file);
  const headings = file.data.headings || [];
  // 搜索用的纯文本改从 markdown 源里剥标记，不再剥渲染后的 HTML：
  // 公式渲染成 KaTeX 后会变成一大堆辅助 span（MathML 一份 + 视觉一份），
  // 剥完标签只剩碎片；而源里的 \(V_\pi\) 反而是最干净的检索词。
  const plainText = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, " ")
    .replace(/[*|~>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    id: path.basename(filePath, path.extname(filePath)),
    title: data.title || headings[0]?.text || path.basename(filePath),
    description: data.description || "",
    order: Number(data.order) || 0,
    html,
    plainText,
    headings,
  };
}

export async function getNotes() {
  const files = fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith(".md"));
  const notes = await Promise.all(files.map((f) => processNote(path.join(NOTES_DIR, f))));
  return notes.sort((a, b) => a.order - b.order);
}
