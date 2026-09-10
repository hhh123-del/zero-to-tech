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
import rehypeStringify from "rehype-stringify";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

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

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlugHeadings)
    // 未知语言（如 powerquery）rehype-highlight 会记一条 warning 后保持纯文本，不会中断构建。
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  const html = String(file);
  const headings = file.data.headings || [];
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
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
