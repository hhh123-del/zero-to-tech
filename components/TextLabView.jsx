"use client";

// 文字实验室页。这一节把"结果"这份 state 提到了这里——因为 InputCard 负责发请求、
// ResultCard 负责显示，两个兄弟组件要共享同一份结果，就放到它们共同的父组件里
//（4.4 学过的"状态提升"）。用了 useState，所以顶上写了 "use client"。
import { useState } from "react";

import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import InputCard from "./InputCard.jsx";
import ResultCard from "./ResultCard.jsx";
import HistoryModal  from "./HistoryModal.jsx";
import { textLab } from "../data/site.js";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function TextLabView() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  async function openHistory() {
    setHistoryOpen(true);
    try {
      const res = await fetch(`${API}/api/history`,{credentials: "include"});
      setHistory(await res.json());
    } catch {
      // 后端没起来时不让页面崩掉，弹窗显示"还没有记录"
    }
  }  



  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
       
        <PageHeading title={textLab.heroTitle} subtitle={textLab.heroSubtitle} />
      </article>

      <InputCard onResult={setResult} apiUrl={`${API}/api/analyze`}/>
      <ResultCard result={result} onOpenHistory={openHistory} />

      <HistoryModal
        open={historyOpen}
        items={history}
        onClose={() => setHistoryOpen(false)}
      />
    </AnimatedCardGrid>
  );
}
