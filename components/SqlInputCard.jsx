"use client";
import { useState } from "react";

export default function SqlInputCard({ onResult,apiUrl }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
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
          rows="8"
          placeholder="例如：查询用户的性别比例。"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {/* state 现身：text 一变，这行数字自动跟着变 */}
        <p className="lab-count">已输入 {text.length} 字</p>
        {error && <p className="lab-error">{error}</p>}
        <button className="primary-button" type="button" onClick={handleAnalyze}>
          开始分析
        </button>
      </form>
    </article>
  );
}
