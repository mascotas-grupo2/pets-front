"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Megaphone,
  UserPlus,
  MessageCircle,
  CalendarClock,
  Clock,
} from "lucide-react";
import { Panel } from "../../ui/panel";
import { getDashboardActivity, type ActivityItem } from "@/services/dashboard";

const ICON: Record<ActivityItem["type"], typeof FileText> = {
  solicitud: FileText,
  mensaje: MessageSquare,
  publicacion: Megaphone,
  usuario: UserPlus,
  comentario: MessageCircle,
  seguimiento: CalendarClock,
};
const TONE: Record<ActivityItem["type"], string> = {
  solicitud: "violet",
  mensaje: "blue",
  publicacion: "pink",
  usuario: "amber",
  comentario: "green",
  seguimiento: "violet",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.floor((Date.now() - then) / 60000);
  if (diffMin < 1) return "Recién";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Hace ${d} día${d === 1 ? "" : "s"}`;
  return new Date(then).toLocaleDateString("es-AR");
}

export function DashboardActivity() {
  const router = useRouter();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardActivity(5)
      .then((res) => {
        if (res.ok && res.data) setItems(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel title="Actividad reciente">
      {loading ? (
        <p className="dash-muted" style={{ padding: "0.5rem 0" }}>
          Cargando…
        </p>
      ) : items.length === 0 ? (
        <p className="dash-muted" style={{ padding: "0.5rem 0" }}>
          Sin actividad reciente.
        </p>
      ) : (
        <ul className="activity-list">
          {items.map((it) => {
            const Icon = ICON[it.type] ?? Clock;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  className="activity-item"
                  onClick={() => router.push(it.link)}
                >
                  <span className={`activity-icon tone-${TONE[it.type] ?? "blue"}`}>
                    <Icon size={16} aria-hidden />
                  </span>
                  <span className="activity-body">
                    <span className="activity-title">{it.title}</span>
                    {it.detail && (
                      <span className="activity-detail">{it.detail}</span>
                    )}
                  </span>
                  <span className="activity-time">{relativeTime(it.at)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
