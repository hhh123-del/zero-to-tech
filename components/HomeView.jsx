"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import { home } from "../data/site.js";

export default function HomeView() {
  const [data] = useState(home);

  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <PageHeading title={data.heroTitle} subtitle={data.heroSubtitle} />
      </article>

      {/* 两个核心项目卡片并排 */}
      <article className="panel card panel-half">
        <p className="section-kicker">{data.featuredWork.kicker}</p>
        <p className="featured-title">{data.featuredWork.title}</p>
        <p className="block-text">{data.featuredWork.copy}</p>
        <Link className="featured-link" href={data.featuredWork.href}>
          <span className="featured-link-label">{data.featuredWork.linkLabel}</span>
          <span className="arrow">›</span>
        </Link>
      </article>

      <article className="panel card panel-half">
        <p className="section-kicker">{data.secondWork.kicker}</p>
        <p className="featured-title">{data.secondWork.title}</p>
        <p className="block-text">{data.secondWork.copy}</p>
        <Link className="featured-link" href={data.secondWork.href}>
          <span className="featured-link-label">{data.secondWork.linkLabel}</span>
          <span className="arrow">›</span>
        </Link>
      </article>

      {/* 学习笔记大卡片 */}
      <article className="panel panel-full card">
        <p className="section-kicker">{data.noteBlock.kicker}</p>
        <h3 className="block-title">{data.noteBlock.title}</h3>
        <p className="block-text">{data.noteBlock.copy}</p>
        <Link className="featured-link" href={data.noteBlock.href}>
          <span className="featured-link-label">{data.noteBlock.linkLabel}</span>
          <span className="arrow">›</span>
        </Link>
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
