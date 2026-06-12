import { MessageSquare, FileText, Megaphone, Bell } from "lucide-react";
import type { Notification } from "@/services/notifications";

/** Formato relativo simple ("recién", "hace 5 min", "hace 2 h", "hace 3 d"). */
export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "recién";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

const TYPE_META: Record<string, { Icon: typeof Bell; tone: string }> = {
  message: { Icon: MessageSquare, tone: "violet" },
  adoption_status: { Icon: FileText, tone: "green" },
  publication: { Icon: Megaphone, tone: "amber" },
};

/** Una notificación (ícono por tipo + contenido). Usada por la campana y la vista. */
export function NotificationItem({
  n,
  onClick,
}: {
  n: Notification;
  onClick: (n: Notification) => void;
}) {
  const { Icon, tone } = TYPE_META[n.type] ?? { Icon: Bell, tone: "violet" };
  return (
    <button
      type="button"
      className={`notif-item${n.read ? "" : " is-unread"}`}
      onClick={() => onClick(n)}
    >
      <span className={`notif-item-icon tone-${tone}`} aria-hidden>
        <Icon size={16} />
      </span>
      <span className="notif-item-main">
        <span className="notif-item-title">{n.title}</span>
        {n.body && <span className="notif-item-body">{n.body}</span>}
        <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
      </span>
    </button>
  );
}
