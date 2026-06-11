"use client";

import { InboxConversation } from "@/services/messages.services";
import { Loader2, Search, Plus, MessageSquare } from "lucide-react";
import { initials } from "../dashboard/dashboard.data";
import type { TipoConversacion } from "../hook/messages/useInbox";

type Props = {
  conversations: InboxConversation[];
  loading: boolean;
  query: string;
  setQuery: (value: string) => void;
  tipo: TipoConversacion;
  setTipo: (t: TipoConversacion) => void;
  counts: { todas: number; usuarios: number; internos: number };
  activeUserId: number | null;
  onSelect: (userId: number) => void;
  onNew: () => void;
};

const TABS: { id: TipoConversacion; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "usuarios", label: "Usuarios" },
  { id: "internos", label: "Internos" },
];

export default function InboxList({
  conversations,
  loading,
  query,
  setQuery,
  tipo,
  setTipo,
  counts,
  activeUserId,
  onSelect,
  onNew,
}: Props) {
  return (
    <aside className="msg-list-panel" aria-label="Conversaciones">
      <div className="msg-panel-head">
        <div className="msg-panel-title">
          <span className="msg-panel-icon" aria-hidden>
            <MessageSquare size={18} />
          </span>
          <div>
            <h3>Mensajes</h3>
            <p>Conversaciones con usuarios e internos</p>
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={onNew}>
          <Plus size={15} aria-hidden /> Nuevo
        </button>
      </div>

      <div className="msg-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`msg-tab${tipo === t.id ? " is-active" : ""}`}
            onClick={() => setTipo(t.id)}
          >
            {t.label} <span className="msg-tab-count">{counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className="admin-search msg-search msg-search-block">
        <Search size={16} />
        <input
          type="search"
          placeholder="Buscar conversación..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      ) : (
        <ul className="msg-list">
          {conversations.length === 0 && (
            <li className="msg-empty-list">No hay conversaciones.</li>
          )}

          {conversations.map((c) => {
            const isActive = activeUserId === c.user?.id;
            const subtitle = c.user?.context ?? c.latestMessage?.content;

            return (
              <li key={c.user.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.user.id)}
                  className={`msg-item ${isActive ? "is-active" : ""}`}
                >
                  {c.user.photo ? (
                    <img
                      src={c.user.photo}
                      alt={c.user.name}
                      className="msg-avatar object-cover"
                    />
                  ) : (
                    <span className="msg-avatar">{initials(c.user.name)}</span>
                  )}

                  <span className="msg-item-body">
                    <span className="msg-item-name">{c.user.name}</span>
                    <span className="msg-item-sub truncate">{subtitle}</span>
                  </span>

                  <span className="msg-item-meta">
                    <span className="msg-item-time">
                      {new Date(c.latestMessage.createdAt).toLocaleDateString()}
                    </span>
                    {c.unread > 0 && (
                      <span className="msg-unread">{c.unread}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
