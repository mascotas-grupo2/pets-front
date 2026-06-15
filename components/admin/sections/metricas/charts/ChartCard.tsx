"use client";

import React from "react";

export type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function ChartCard({ title, subtitle, children, className = "" }: ChartCardProps) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-header">
        <h3 className="chart-card-title">{title}</h3>
        {subtitle && <span className="chart-card-subtitle">{subtitle}</span>}
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}
