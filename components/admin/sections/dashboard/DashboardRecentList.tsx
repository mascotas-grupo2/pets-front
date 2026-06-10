"use client";

import type { Actividad } from "./dashboard.data";
import { Panel } from "../../ui/panel";

export function DashboardRecentList({ items }: { items: Actividad[] }) {
  return (
    <Panel title="Actividad reciente">
      <ul className="dash-activity">
        {items.map((a) => {
          const Icon = a.icon;
          return (
            <li key={a.titulo} className="dash-activity-item">
              <span className={`dash-activity-icon tone-${a.tone}`}>
                <Icon size={16} aria-hidden />
              </span>
              <span className="dash-activity-text">
                <span className="dash-activity-title">{a.titulo}</span>
                <span className="dash-activity-detail">{a.detalle}</span>
              </span>
              <span className="dash-activity-time">{a.tiempo}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
