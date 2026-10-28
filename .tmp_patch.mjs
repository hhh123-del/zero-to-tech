import fs from "fs";
import path from "path";
import matter from "gray-matter";

const TALL = /\\(frac|dfrac|tfrac|cfrac|sum|prod|coprod|int|iint|oint|lim|sqrt|binom|overline|underline|begin\s*\{)/;
const CN = { "，": ",", "。": ".", "；": ";", "：": ":", "、": ",", "（": "(", "）": ")" };
const fixP = (t) =>
  t
    .split(/(\\text\{[^}]*\})/g)
    .map((s, i) => (i % 2 === 1 ? s : s.replace(/[，。；：、（）]/g, (c) => CN[c])))
    .join("");

function convert(text) {
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, body, offset, whole) => {
      const lineStart = whole.lastIndexOf("\n", offset - 1) + 1;
      const lineBefore = whole.slice(lineStart, offset);
      const lead = (lineBefore.match(/^[ \t]*/) || [""])[0];
      const mark = lineBefore.slice(lead.length).match(/^([*+-]|\d+[.)])\s+/);
      const indent = mark ? " ".repeat(lead.length + mark[0].length) : lead;
      const lines = body.split("\n").map((l) => l.trim());
      while (lines.length && !lines[0]) lines.shift();
      while (lines.length && !lines[lines.length - 1]) lines.pop();
      return `\n\n${indent}$$\n${lines.map((l) => (l ? indent + fixP(l) : "")).join("\n")}\n${indent}$$\n\n`;
    })
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, b) => {
      const tex = fixP(b.trim());
      if (!TALL.test(tex) || /^\\displaystyle/.test(tex)) return `$${tex}$`;
      return `$\\displaystyle ${tex}$`;
    });
}

const { content } = matter(fs.readFileSync("content/notes/machine-learning.md", "utf8"));
const out = convert(content);
const idx = out.indexOf("激活函数 (Softmax)");
console.log("=== 转换后（激活函数 附近）===");
console.log(JSON.stringify(out.slice(idx - 20, idx + 700)));
