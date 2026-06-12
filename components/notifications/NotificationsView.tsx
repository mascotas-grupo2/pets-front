"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useNotifications } from "./useNotifications";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/services/notifications";

/** Lista completa de notificaciones para la pestaña de la cuenta. */
export function NotificationsView() {
  const router = useRouter();
  const { items, unread, loading, load, markRead, markAll } = useNotifications();

  useEffect(() => {
    void load();
  }, [load]);

  async function onClick(n: Notification) {
    if (!n.read) await markRead(n.id);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="notif-view">
      <div className="notif-view-head">
        <h3>Notificaciones</h3>
        {unread > 0 && (
          <button type="button" className="notif-markall" onClick={() => void markAll()}>
            <Check size={14} aria-hidden /> Marcar todas como leídas
          </button>
        )}
      </div>
      {loading ? (
        <p className="notif-empty">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="notif-empty">No tenés notificaciones.</p>
      ) : (
        <ul className="notif-view-list">
          {items.map((n) => (
            <li key={n.id}>
              <NotificationItem n={n} onClick={onClick} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
