import { Panel } from "@/components/admin/ui/panel";
import React from "react";
import { CITAS } from "../dashboard.data";

const CitasPanel = () => {
  return (
    <Panel title="Próximas Citas Veterinarias">
      <ul className="dash-activity divided">
        {CITAS.map((c) => (
          <li key={c.mascota} className="dash-activity-item">
            <span className={`dash-activity-icon tone-${c.tone}`}>
              {c.mascota.charAt(0)}
            </span>
            <span className="dash-activity-text">
              <span className="dash-activity-title">{c.mascota}</span>
              <span className="dash-activity-detail">{c.tipo}</span>
            </span>
            <span className="dash-when">
              <span className="dash-when-date">{c.fecha}</span>
              <span className="dash-when-time">{c.hora}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default CitasPanel;
