"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

// 按需注册：本项目只用柱状图、折线图、饼图，其余组件不打包，减小体积。
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

// 用 ECharts 把后端返回的图表配置（option）渲染成真正的统计图。
// 后端只给配置 JSON，这里负责在浏览器里把它画出来。
export default function EChartCard({ option }) {
  const domRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!option || !domRef.current) return;
    if (!chartRef.current) {
      chartRef.current = echarts.init(domRef.current);
    }
    chartRef.current.setOption(option, true);
  }, [option]);

  // 窗口缩放时重绘，卸载时销毁实例，避免内存泄漏
  useEffect(() => {
    const onResize = () => chartRef.current && chartRef.current.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, []);

  if (!option) return null;

  return <div ref={domRef} style={{ width: "100%", height: "360px" }} />;
}
