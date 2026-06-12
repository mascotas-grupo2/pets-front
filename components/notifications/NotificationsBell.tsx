"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotifications } from "./useNotifications";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/services/notifications";

/** Campana con badge de no leídas + dropdown de notificaciones. */
export function NotificationsBell() {
  const router = useRouter();
  const { items, unread, loading, load, markRead, markAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    void load();
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, load]);

  async function onItemClick(n: Notification) {
    if (!n.read) await markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="notif-wrap" ref={ref}>
      <button
        type="button"
        className="admin-icon-btn"
        aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={18} aria-hidden />
        {unread > 0 && (
          <span className="admin-icon-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-dropdown-head">
            <h4>Notificaciones</h4>
            {unread > 0 && (
              <button type="button" className="notif-markall" onClick={() => void markAll()}>
                <Check size={14} aria-hidden /> Marcar todas
              </button>
            )}
          </div>
          <div className="notif-list">
            {loading ? (
              <p className="notif-empty">Cargando…</p>
            ) : items.length === 0 ? (
              <p className="notif-empty">No tenés notificaciones.</p>
            ) : (
              items.map((n) => (
                <NotificationItem key={n.id} n={n} onClick={onItemClick} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
