"use client";

// 学习笔记页。它是个客户端组件——因为要"搜索 / 选中哪一篇 / 折叠大纲 / 滚动定位"，
// 这些都得在浏览器里跑、要靠 state，所以顶上写 "use client"。
//
// markdown 的"解析"不在前端做：lib/notes.js 已在构建期把 .md 转成带标题 id 的 HTML +
// 大纲数组（headings），这里只负责：
//   1. 搜索框 → 过滤标题/正文；
//   2. 侧栏大纲 → 按标题层级折叠/展开，点击跳转；
//   3. 主区 → 用 dangerouslySetInnerHTML 渲染预生成的 HTML。
// 内容是自己维护的静态笔记、无运行时输入注入，这个用法是安全的。

import { useEffect, useState } from "react";
import PageHeading from "./PageHeading.jsx";

// 把扁平的 headings（每个带 depth）转成树：标题是"最近一个层级更浅的标题"的子节点。
function buildTree(headings) {
  const root = { depth: 0, children: [] };
  const stack = [root];
  for (const h of headings) {
    const node = { ...h, children: [] };
    while (stack.length > 1 && stack[stack.length - 1].depth >= h.depth) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root.children;
}

// 收集所有"有子标题"的节点 id（供"全部折叠"用）。
function collectParentIds(nodes, out) {
  for (const n of nodes) {
    if (n.children.length > 0) {
      out.add(n.id);
      collectParentIds(n.children, out);
    }
  }
}

// 搜索时返回每个笔记里"命中的标题"（或一个命中提示），扁平展示，不参与折叠。
function buildSearchResults(notes, q) {
  return notes
    .map((note) => {
      const matchedHeadings = note.headings.filter((h) =>
        h.text.toLowerCase().includes(q)
      );
      const titleHit =
        note.title.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q);
      const bodyHit = note.plainText.toLowerCase().includes(q);

      if (matchedHeadings.length === 0 && !titleHit && !bodyHit) return null;

      let hint = null;
      if (matchedHeadings.length === 0) {
        hint = titleHit ? "标题 / 简介匹配" : "正文包含关键字";
      }
      return { note, matchedHeadings, hint };
    })
    .filter(Boolean);
}

// 单个大纲节点（递归渲染子树）。
function OutlineItem({ node, noteId, collapsed, onToggle, onSelect }) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.id);
  return (
    <div className="notes-outline-node">
      <div
        className="notes-outline-row"
        style={{ paddingLeft: 12 + (node.depth - 1) * 12 }}
      >
        {hasChildren ? (
          <button
            className="notes-toggle"
            aria-label={isCollapsed ? "展开" : "折叠"}
            onClick={() => onToggle(node.id)}
          >
            {isCollapsed ? "▸" : "▾"}
          </button>
        ) : (
          <span className="notes-toggle-spacer" />
        )}
        <button
          className="notes-outline-item"
          onClick={() => onSelect(noteId, node.id)}
        >
          {node.text}
        </button>
      </div>
      {hasChildren && !isCollapsed && (
        <div className="notes-outline-children">
          {node.children.map((child) => (
            <OutlineItem
              key={child.id}
              node={child}
              noteId={noteId}
              collapsed={collapsed}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesView({ notes }) {
  const [activeId, setActiveId] = useState(notes[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [pendingScroll, setPendingScroll] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());

  const active = notes.find((n) => n.id === activeId) ?? notes[0];
  const q = query.trim().toLowerCase();
  const searchResults = q ? buildSearchResults(notes, q) : null;

  // 每篇笔记的大纲树（只在未搜索时用）。
  const trees = notes.reduce((acc, n) => {
    acc[n.id] = buildTree(n.headings);
    return acc;
  }, {});

  // 点了大纲里的标题后：先切到那篇笔记，等 React 渲染出正文，再滚动到对应 id。
  useEffect(() => {
    if (!pendingScroll) return;
    const el = document.getElementById(pendingScroll);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setPendingScroll(null);
  }, [pendingScroll, activeId]);

  function selectNote(noteId) {
    setActiveId(noteId);
  }

  function selectHeading(noteId, headingId) {
    setActiveId(noteId);
    setPendingScroll(headingId);
  }

  function toggleNode(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  function collapseAll() {
    const all = new Set();
    notes.forEach((n) => collectParentIds(trees[n.id], all));
    setCollapsed(all);
  }

  return (
    <div className="notes-page">
      <article className="hero-stage panel-full">
        <PageHeading
          title="学习笔记"
          subtitle="数据分析 · 全栈，Markdown 渲染，支持搜索与大纲"
        />
      </article>

      <div className="notes-layout">
        {/* 侧栏：搜索框固定在上，大纲在下面独立滚动 */}
        <aside className="notes-sidebar panel">
          <input
            className="notes-search"
            type="search"
            placeholder="搜索笔记…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {!q && (
            <div className="notes-outline-controls">
              <button className="notes-control" onClick={expandAll}>
                全部展开
              </button>
              <button className="notes-control" onClick={collapseAll}>
                全部折叠
              </button>
            </div>
          )}

          <div className="notes-outline">
            {q
              ? searchResults.map((entry) => (
                  <div className="notes-group" key={entry.note.id}>
                    <button
                      className={
                        "notes-note-title" +
                        (entry.note.id === activeId ? " active" : "")
                      }
                      onClick={() => selectNote(entry.note.id)}
                    >
                      {entry.note.title}
                    </button>
                    {entry.hint && (
                      <p className="notes-hint">{entry.hint}</p>
                    )}
                    {entry.matchedHeadings.map((h) => (
                      <button
                        key={h.id}
                        className="notes-outline-item"
                        style={{ paddingLeft: 12 + (h.depth - 1) * 12 }}
                        onClick={() => selectHeading(entry.note.id, h.id)}
                      >
                        {h.text}
                      </button>
                    ))}
                  </div>
                ))
              : notes.map((note) => (
                  <div className="notes-group" key={note.id}>
                    <button
                      className={
                        "notes-note-title" +
                        (note.id === activeId ? " active" : "")
                      }
                      onClick={() => selectNote(note.id)}
                    >
                      {note.title}
                    </button>
                    {trees[note.id].map((node) => (
                      <OutlineItem
                        key={node.id}
                        node={node}
                        noteId={note.id}
                        collapsed={collapsed}
                        onToggle={toggleNode}
                        onSelect={selectHeading}
                      />
                    ))}
                  </div>
                ))}
            {q && searchResults.length === 0 && (
              <p className="notes-hint">没有匹配的内容</p>
            )}
          </div>
        </aside>

        {/* 主区：渲染当前选中的那一篇 */}
        <section className="notes-main">
          {active && (
            <article className="notes-doc panel">
              {active.description && (
                <p className="notes-desc">{active.description}</p>
              )}
              <div
                className="notes-body"
                dangerouslySetInnerHTML={{ __html: active.html }}
              />
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
