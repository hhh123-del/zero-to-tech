"use client";
import { useState } from "react";

const DEFAULT_TEXT = "统计不同区域用户的平均消费金额";

export default function SqlInputCard({ onResult,apiUrl }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isActive, setIsActive] = useState(false);

  async function handleAnalyze() {
    setError("");
    setIsActive(true);
    const finalText = text.trim() || DEFAULT_TEXT;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalText }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `分析失败：${res.status}`);
      }

      const ret = await res.json();
      console.log("SqlInputCard拿到的ret：", ret);
      onResult(ret);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <article className="panel panel-half lab-panel card">
      <div className="panel-heading">
        <p className="section-kicker">输入区</p>
        <h3>业务查询提问</h3>
      </div>
      <form className="lab-form" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="text-input">文本内容</label>
        <textarea
          id="text-input"
          rows="4"
          placeholder={DEFAULT_TEXT}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ color: text ? "#000" : "#999" }}
        />
        <p className="lab-count">已输入 {(text || DEFAULT_TEXT).length} 字</p>
        {error && <p className="lab-error">{error}</p>}
        <button className="primary-button" type="button" onClick={handleAnalyze}>
          开始分析
        </button>
      </form>
    </article>
  );
}
