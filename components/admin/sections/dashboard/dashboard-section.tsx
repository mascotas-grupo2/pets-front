"use client";

import { SectionProps } from "../registry";
import StatusCard from "../../ui/StatusCard";
import { STATS } from "./dashboard.data";
import ActividadPanel from "./Panels/actividad-panel";
import CitasPanel from "./Panels/citas-panel";
import CostosPanel from "./Panels/costos-panel";
import PublicacionesPanel from "./Panels/publicaciones-panel";
import SeguimientosPanel from "./Panels/seguimientos-panel";
import SolicitudesPanel from "./Panels/solicitud-panel";

function StatCards() {
  return (
    <div className="dash-stats">
      {STATS.map((s) => <StatusCard key={s.label} card={s} />)}
    </div>
  );
}

export function DashboardSection({ setActive }: SectionProps) {
  return (
    <div className="dash">
      <StatCards/>
      <div className="dash-grid">
        <SolicitudesPanel setActive={() => setActive("solicitudes")}  />
        <SeguimientosPanel setActive={() => setActive("seguimientos")} />
      </div>
      <div className="dash-grid">
        <PublicacionesPanel  setActive={() => setActive("reportes")} />
        <ActividadPanel />
      </div>
      <div className="dash-grid">
        <CitasPanel />
        <CostosPanel />
      </div>
    </div>
  );
}
