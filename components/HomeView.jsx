"use client";

// 个人主页。这一节把它从"纯展示"改成了"会去后端取数据"。
// 打开页面时先用 site.js 的 home 打底，再用 useEffect 去 GET /api/profile，
// 拿到后端数据后 setData 更新界面。因为要在浏览器里发请求，所以顶上写了 "use client"。
// 请求失败时（比如后端没跑、跨源被拦）就保持打底数据、把错误打到控制台，页面不至于崩。
// 注意：后端地址暂时写死在下面，跟着课件，这一节最后会把它收进 .env.local。
import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import { home } from "../data/site.js";
const API = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function HomeView() {
  const [data, setData] = useState(home);

  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav />
        <PageHeading title={data.heroTitle} subtitle={data.heroSubtitle} />
      </article>

      <article className="panel panel-full featured-work-panel card">
        <p className="section-kicker">{data.featuredWork.kicker}</p >
        <div className="work-two-col">
          <div className="panel card">
            <p className="section-kicker">{data.featuredWork.kicker}</p >
            <p className="featured-title">{data.featuredWork.title}</p >
            <p className="featured-copy">{data.featuredWork.copy}</p >
            <Link className="featured-link" href={data.featuredWork.href}>
              <span className="featured-link-label">{data.featuredWork.linkLabel}</span>
              <span className="arrow">›</span>
            </Link>
          </div>
          <div className="panel card">
            <p className="section-kicker">{data.secondWork.kicker}</p >
            <p className="featured-title">{data.secondWork.title}</p >
            <p className="featured-copy">{data.secondWork.copy}</p >
            <Link className="featured-link" href={data.secondWork.href}>
              <span className="featured-link-label">{data.secondWork.linkLabel}</span>
              <span className="arrow">›</span>
            </Link>
          </div>
        </div>
      </article>

      {/* ========== 数据分析项目模块 ========== */}
      <article className="panel panel-full card">
        <p className="section-kicker">{data.rfmProject.kicker}</p >
        <h3 className="block-title">{data.rfmProject.title}</h3>
        <p className="block-text">{data.rfmProject.copy}</p >
        <a className="featured-link" href={data.rfmProject.href} target="_blank" rel="noopener noreferrer">
          <span className="featured-link-label">{data.rfmProject.linkLabel}</span>
          <span className="arrow">&gt;</span>
        </a >
      </article>
      
      {/* ========== 技术复盘模块 ========== */}
      <article className="panel panel-full card">
        <p className="section-kicker">{data.techReview.kicker}</p >
        <h3 className="block-title">{data.techReview.title}</h3>
        <div className="block-text">
          {data.techReview.points.map((item, i) => (
            <p key={i}>• {item}</p >
          ))}
        </div>
        <Link className="featured-link" href={data.techReview.href}>
          <span className="featured-link-label">{data.techReview.linkLabel}</span>
          <span className="arrow">›</span>
        </Link>
      </article>
      
      {/* ========== 学习笔记模块 ========== */}
      <article className="panel panel-full card">
        <p className="section-kicker">{data.noteBlock.kicker}</p >
        <p className="block-text">{data.noteBlock.copy}</p >
      </article>
            
      
      <article className="panel panel-full identity-panel card">
        <div className="identity-item">
          <p className="section-kicker">座右铭</p>
          <p className="identity-value identity-quote">{data.identity.motto}</p>
        </div>
        <div className="identity-item">
          <p className="section-kicker">正在学习</p>
          <p className="identity-value">{data.identity.learning}</p>
        </div>
      </article>
    </AnimatedCardGrid>
  );
}
