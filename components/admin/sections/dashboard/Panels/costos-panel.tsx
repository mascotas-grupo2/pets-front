import { Panel } from "@/components/admin/ui/panel";
import { COSTOS } from "../dashboard.data";

const CostosPanel = () => {
  return (
    <Panel title="Resumen de Costos">
      <ul className="dash-activity">
        {COSTOS.map((c) => {
          const Icon = c.icon;
          return (
            <li key={c.categoria} className="dash-activity-item">
              <span className={`dash-cost-icon tone-${c.tone}`}>
                <Icon size={18} aria-hidden />
              </span>
              <span className="dash-activity-text">
                <span className="dash-activity-title">{c.categoria}</span>
                <span className="dash-activity-detail">{c.pct}</span>
              </span>
              <span className="dash-cost-amount">{c.monto}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default CostosPanel;
