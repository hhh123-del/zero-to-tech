"use client";

import { useState } from "react";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import SqlInputCard from "./SqlInputCard.jsx";
import EChartCard from "./EChartCard.jsx";
import { sqlAgentLab } from "../data/site.js";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SqlAgentLabView() {
  const [result, setResult] = useState("");
  const [chart, setChart] = useState(null);
  const [showExamples, setShowExamples] = useState(false);

  return (
    <AnimatedCardGrid className="dashboard-grid">
      {/* 顶部 hero：导航 + 大标题，和 TextLab 页保持一致 */}
      <article className="hero-stage panel-full">
        <Nav />
        <PageHeading title={sqlAgentLab.heroTitle} subtitle={sqlAgentLab.heroSubtitle} />
      </article>

      {/* 顶部通栏介绍卡片，带折叠示例提问 */}
      <article className="panel panel-full card">
        <div className="block-text">
          <p>本项目基于Dify Agent搭建，后端接入电商RFM数据集。输入自然语言，系统自动生成SQL完成查询，返回数据表与可视化图表。</p>
        </div>

        <button
          onClick={() => setShowExamples(!showExamples)}
          style={{ margin: "8px 0" }}
        >
          {showExamples ? "收起推荐提问 ▲" : "展开查看推荐提问 ▼"}
        </button>

        {showExamples && (
          <div style={{ padding: "16px", background: "#e8f4ff", borderRadius: "6px", margin: "8px 0" }}>
            <p><strong>✨推荐尝试提问（可以直接复制）：</strong></p>
            <ul style={{ paddingLeft: "20px" }}>
              <li>统计不同区域用户的平均消费金额</li>
              <li>统计不同区域的人数占比</li>
              <li>统计用户品类偏好分布</li>
            </ul>
          </div>
        )}

        <div style={{ padding: "12px", background: "#fff8dc", borderRadius: "6px", margin: "8px 0" }}>
          ⚠️仅支持查询数据表，不能新增、修改、删除数据；极复杂多维度分析可能存在误差。
        </div>

        <a
          href="/report/rfm/README.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          👉跳转查看配套：电商RFM用户分层分析完整报告
        </a>
      </article>

      {/* 左右分栏：输入区 + 结果区，panel-half 在 dashboard-grid 里各占 6 列 */}
      <SqlInputCard
        apiUrl={`${API}/api/sql-agent-lab`}
        onResult={(data) => {
          console.log("SqlAgentLabView收到data：", data);
          setResult(data.result);
          setChart(data.chart || null);
        }}
      />

      <article className="panel panel-half lab-panel result-panel card">
        <div className="panel-heading">
          <p className="section-kicker">结果区</p>
          <h3>分析结果</h3>
        </div>
        <div className="result-stack">
          {result || chart ? (
            <>
              {result && <div style={{ whiteSpace: "pre-wrap" }}>{result}</div>}
              {chart && <EChartCard option={chart} />}
            </>
          ) : (
            <div>提交问题后，SQL、数据表格、图表将展示在这里</div>
          )}
        </div>
      </article>
    </AnimatedCardGrid>
  );
}
