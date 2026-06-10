"use client";

import { InboxConversation, } from "@/services/messages.services";
import { Loader2, Search } from "lucide-react";
import { initials } from "./mensajes.data";

type Props = {
  conversations: InboxConversation[];
  loading: boolean;
  query: string;
  setQuery: (value: string) => void;
  activeUserId: number | null;
  onSelect: (userId: number) => void;
  onNew: () => void;
};

export default function InboxList({
  conversations,
  loading,
  query,
  setQuery,
  activeUserId,
  onSelect,
  onNew,
}: Props) {
  return (
    <aside className="msg-list-panel" aria-label="Conversaciones">
      <div className="flex items-center gap-2 m-4">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onNew}
        >
          + Nuevo
        </button>

        <div className="admin-search msg-search flex-1">
          <Search size={16} />

          <input
            type="search"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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

                    <span className="msg-item-sub truncate">
                      {c.latestMessage?.content}
                    </span>
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
