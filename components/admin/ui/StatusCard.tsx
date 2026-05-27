import { LucideIcon } from "lucide-react";
import React from "react";

interface StatusProps {
  card: {
    tone: string;
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
  };
}
const StatusCard: React.FC<StatusProps> = ({ card }) => {
  const Icon = card.icon;
  return (
    <div className="dash-stat-card">
      <div className={`dash-stat-icon tone-${card.tone}`}>
        <Icon size={22} aria-hidden />
      </div>
      <div className="dash-stat-body">
        <span className="dash-stat-label">{card.label}</span>
        <span className="dash-stat-value">{card.value}</span>
        <span className="dash-stat-hint">{card.hint}</span>
      </div>
    </div>
  );
};

export default StatusCard;
