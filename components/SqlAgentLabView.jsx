"use client";

import { useState } from "react";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import SqlInputCard from "./SqlInputCard.jsx";
import EChartCard from "./EChartCard.jsx";
import { sqlAgentLab } from "../data/site.js";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SqlAgentLabView() {
  const [result, setResult] = useState("");
  const [sql, setSql] = useState("");
  const [chart, setChart] = useState(null);
  const [showExamples, setShowExamples] = useState(false);

  return (
    <AnimatedCardGrid className="dashboard-grid">
      {/* 顶部 hero：导航 + 大标题，和 TextLab 页保持一致 */}
      <article className="hero-stage panel-full">
        <PageHeading title={sqlAgentLab.heroTitle} subtitle={sqlAgentLab.heroSubtitle} />
      </article>

      {/* RFM项目介绍（精华版） */}
      <article className="panel panel-full card">
        <div className="block-text">
          <p>本项目基于 <strong>1000名电商用户</strong> 的行为与消费数据，构建了改良版 RFM-RFI 用户价值分层模型。传统RFM只看消费，本项目额外引入意向度、活跃度、兴趣匹配等维度，将用户细分为15类画像，并验证了优化策略的ROI提升效果。</p>
        </div>

        {/* 数据概况 */}
        <div style={{ margin: "16px 0", padding: "12px", background: "#f8f9fa", borderRadius: "6px" }}>
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>📦 数据概况</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", fontSize: "13px" }}>
            <div>
              <p><strong>数据规模：</strong>1000条用户记录 × 15个字段</p>
            </div>
            <div>
              <p><strong>字段分类：</strong>基本信息 / 行为特征 / 消费特征</p>
            </div>
            <div>
              <p><strong>数据质量：</strong>无缺失值、无重复值、无异常值</p>
            </div>
          </div>
          
          {/* 字段说明表 */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "6px" }}>分类</th>
                <th style={{ textAlign: "left", padding: "6px" }}>字段名</th>
                <th style={{ textAlign: "left", padding: "6px" }}>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "6px" }}>基本信息</td>
                <td style={{ padding: "6px" }}>Age, Gender, Region, Income</td>
                <td style={{ padding: "6px" }}>年龄、性别、地区、收入水平</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "6px" }}>行为特征</td>
                <td style={{ padding: "6px" }}>Last_Login, Pages_Viewed, Time_Spent</td>
                <td style={{ padding: "6px" }}>最近登录天数、浏览页数、网站停留时长</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "6px" }}>消费特征</td>
                <td style={{ padding: "6px" }}>Frequency, Avg_Order, Total_Spending</td>
                <td style={{ padding: "6px" }}>购买频率、平均订单金额、总消费金额</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "16px 0" }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>📊 核心结论：策略效率对比</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "6px" }}>指标</th>
                  <th style={{ textAlign: "center", padding: "6px" }}>传统RFM</th>
                  <th style={{ textAlign: "center", padding: "6px" }}>优化RFI</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px" }}>预算使用率</td>
                  <td style={{ textAlign: "center", padding: "6px" }}>20.0%</td>
                  <td style={{ textAlign: "center", padding: "6px", fontWeight: 600 }}>15.9%</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px" }}>边际ROI</td>
                  <td style={{ textAlign: "center", padding: "6px" }}>4.0%</td>
                  <td style={{ textAlign: "center", padding: "6px", fontWeight: 600, color: "#2e7d32" }}>33.5%</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>优化策略用更少预算实现了更高ROI，效率提升约8倍。</p>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>👥 用户分层分布</p>
            <img src="/report/rfm/segment_distribution.png" alt="用户分层分布" style={{ width: "100%", borderRadius: "6px" }} />
          </div>
        </div>

        <a 
          href="/report/rfm/README.html" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: "inline-block",
            padding: "8px 16px",
            background: "#fff3e0",
            border: "1px solid #ff9800",
            borderRadius: "6px",
            color: "#e65100",
            fontSize: "14px",
            textDecoration: "none",
            fontWeight: 500
          }}
        >
          📄 查看完整分析报告（含数据清洗、假设检验、全维度图表）→
        </a>
      </article>

      {/* 交互Demo + 示例结果 合并卡片 */}
      <article className="panel panel-full card">
        <p className="section-kicker">交互Demo</p>
        <p style={{ marginBottom: "12px" }}>输入自然语言问题，系统自动生成SQL查询并返回图表：</p>

        <button
          onClick={() => setShowExamples(!showExamples)}
          style={{ margin: "8px 0" }}
        >
          {showExamples ? "收起推荐提问 ▲" : "展开推荐提问 ▼"}
        </button>

        {showExamples && (
          <div style={{ padding: "16px", background: "#e8f4ff", borderRadius: "6px", margin: "8px 0" }}>
            <p><strong>✨可以直接复制试试：</strong></p>
            <ul style={{ paddingLeft: "20px" }}>
              <li>统计不同区域用户的平均消费金额</li>
              <li>统计不同区域的人数占比</li>
              <li>统计用户品类偏好分布</li>
            </ul>
          </div>
        )}

        <div style={{ padding: "12px", background: "#fff8dc", borderRadius: "6px", margin: "8px 0" }}>
          ⚠️仅支持查询数据表，不能新增、修改、删除数据。
        </div>

        {/* 示例结果展示 */}
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
          <p style={{ fontWeight: 600, marginBottom: "12px", fontSize: "14px" }}>📌 示例输出效果：</p>
          
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
            💡 说明：以下功能由我基于Dify自建工作流，独立设计的数据查询助手实现，本页面仅作为前端调用入口。
          </p>

          <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "6px" }}>
            <p style={{ marginBottom: "8px", fontSize: "13px" }}><strong>❓ 提问：</strong>统计不同区域用户的平均消费金额</p>
            <p style={{ fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>📝 生成的SQL语句：</p>
            <pre style={{ 
              background: "#fff", 
              padding: "10px", 
              borderRadius: "6px", 
              fontSize: "12px",
              overflowX: "auto",
              margin: "0 0 12px 0",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all"
            }}>
              <code>SELECT Location, ROUND(AVG(Total_Spending), 2) AS avg_total_spending FROM user_personalized_features GROUP BY Location ORDER BY avg_total_spending DESC;</code>
            </pre>
            <img src="/report/rfm/demo_result.png" alt="不同区域用户平均消费金额查询结果" style={{ width: "60%", borderRadius: "6px", display: "block", margin: "0 auto" }} />
          </div>
        </div>
      </article>

      {/* 左右分栏：输入区 + 结果区，panel-half 在 dashboard-grid 里各占 6 列 */}
      <SqlInputCard
        apiUrl={`${API}/api/sql-agent-lab`}
        onResult={(data) => {
          console.log("SqlAgentLabView收到data：", data);
          setResult(data.result);
          setSql(data.sql || "");
          setChart(data.chart || null);
        }}
      />

      <article className="panel panel-half lab-panel result-panel card">
        <div className="panel-heading">
          <p className="section-kicker">结果区</p>
          <h3>分析结果</h3>
        </div>
        <div className="result-stack" style={{ maxWidth: "100%", overflow: "hidden" }}>
          {result || sql || chart ? (
            <>
              {sql && (
                <div style={{ marginBottom: "16px", maxWidth: "100%" }}>
                  <p style={{ fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>📝 生成的SQL语句：</p>
                  <pre style={{ 
                    background: "#f5f5f5", 
                    padding: "12px", 
                    borderRadius: "6px", 
                    fontSize: "13px",
                    overflowX: "auto",
                    margin: 0,
                    maxWidth: "100%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all"
                  }}>
                    <code>{sql}</code>
                  </pre>
                </div>
              )}
              {result && <div style={{ whiteSpace: "pre-wrap", marginBottom: "16px", wordBreak: "break-word" }}>{result}</div>}
              {chart && <div style={{ maxWidth: "100%" }}><EChartCard option={chart} /></div>}
            </>
          ) : (
            <div>提交问题后，SQL、数据表格、图表将展示在这里</div>
          )}
        </div>
      </article>
    </AnimatedCardGrid>
  );
}
