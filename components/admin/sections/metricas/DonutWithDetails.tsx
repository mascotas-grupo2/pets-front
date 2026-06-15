"use client";

import React from "react";
import { DoughnutChart } from "./charts";
import type { ChartData } from "chart.js";

export type DonutWithDetailsProps = {
  title: string;
  data: ChartData<"doughnut">;
  total: string;
  totalLabel?: string;
  height?: number;
};

export function DonutWithDetails({ title, data, total, totalLabel = "Total", height = 200 }: DonutWithDetailsProps) {
  const labels = data.labels ?? [];
  const dataset = data.datasets?.[0];
  {console.log(data)}
  return (
    <div className="donut-detail-card">
      <h3 className="donut-detail-title">{title}</h3>
      <div className="donut-detail-body">
        <div className="donut-detail-chart" style={{ height }}>
          <div className="donut-detail-center">
            <span className="donut-detail-total">{total}</span>
            <span className="donut-detail-label">{totalLabel}</span>
          </div>
          <DoughnutChart data={data} height={height} />
        </div>
        <div className="donut-detail-legend">
          {labels.map((label, i) => {
            const value = dataset?.data?.[i] ?? 0;
            const total = (dataset?.data ?? []).reduce((a, b) => a + (Number(b) || 0), 0);
            const pct = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : "0";
            const color = Array.isArray(dataset?.backgroundColor)
              ? dataset?.backgroundColor[i]
              : dataset?.backgroundColor;
            return (
              <div key={String(label)} className="donut-detail-legend-item">
                <span className="donut-detail-legend-dot" style={{ background: String(color ?? "#888") }} />
                <span className="donut-detail-legend-label">{String(label)}</span>
                <span className="donut-detail-legend-value">{Number(value).toLocaleString("es-AR")}</span>
                <span className="donut-detail-legend-pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
