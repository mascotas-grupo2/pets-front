"use client";

import { useEffect, useRef } from "react";
import { Loader2, MessageSquare, Search, Send } from "lucide-react";
import type { InboxConversation, Message } from "@/services/messages.services";
import { useMessages } from "./useMessages";
import { initials } from "./messages.data";

function Avatar({ user, small = false }: { user: InboxConversation["user"] | null; small?: boolean }) {
  const name = user?.name || "Usuario";
  const className = `msg-avatar${small ? " msg-avatar-sm" : ""}`;
  return user?.photo ? (
    <img src={user.photo} alt={name} className={`${className} object-cover`} />
  ) : (
    <span className={className} aria-hidden>
      {initials(name)}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center p-8">
      <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
    </div>
  );
}

function Burbuja({ m, isMine, user }: { m: Message; isMine: boolean; user: InboxConversation["user"] | null }) {
  return (
    <div className={`msg-bubble-row ${isMine ? "is-mine" : "is-theirs"}`}>
      {!isMine && <Avatar user={user} small />}
      <div className="msg-bubble">
        <p>{m.content}</p>
        <time>
          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
    </div>
  );
}

/**
 * Bandeja de conversaciones + chat activo contra la API real de mensajes.
 * Lo usan la sección Mensajes del admin y la pestaña Mensajes de la cuenta.
 */
export function MessagesPanel() {
  const {
    isLoggedIn,
    currentUserId,
    loadingInbox,
    activaId,
    activaMessages,
    loadingChat,
    query,
    setQuery,
    draft,
    setDraft,
    sending,
    visibles,
    activaConv,
    abrir,
    enviar,
  } = useMessages();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activaMessages]);

  if (!isLoggedIn) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-lg m-4">
        Debes iniciar sesión para ver tus mensajes.
      </div>
    );
  }

  return (
    <div className="msg h-[600px] border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* ---- Columna izquierda: lista de conversaciones ---- */}
      <aside className="msg-list-panel" aria-label="Conversaciones">
        <div className="admin-search msg-search m-4 mt-4">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar conversación..."
            aria-label="Buscar conversación"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loadingInbox ? (
          <Spinner />
        ) : (
          <ul className="msg-list">
            {visibles.length === 0 && (
              <li className="msg-empty-list">No hay conversaciones.</li>
            )}
            {visibles.map((c, i) => {
              const u = c.user;
              const isActiva = u?.id === activaId;
              const name = u?.name || "Usuario";
              return (
                <li key={u?.id ?? `conv-${i}`}>
                  <button
                    type="button"
                    className={`msg-item${isActiva ? " is-active" : ""}`}
                    onClick={() => u && abrir(u.id)}
                    aria-current={isActiva}
                  >
                    <Avatar user={u} />
                    <span className="msg-item-body">
                      <span className="msg-item-name">{name}</span>
                      <span className="msg-item-sub truncate w-32 sm:w-40">
                        {c.latestMessage?.senderId === currentUserId ? "Tú: " : ""}
                        {c.latestMessage?.content}
                      </span>
                    </span>
                    <span className="msg-item-meta">
                      <span className="msg-item-time">
                        {new Date(c.latestMessage?.createdAt).toLocaleDateString()}
                      </span>
                      {c.unread > 0 && (
                        <span className="msg-unread" aria-label={`${c.unread} sin leer`}>
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
      {/* ---- Columna derecha: conversación activa ---- */}
      <section className="msg-chat-panel" aria-label="Conversación">
        {!activaId || !activaConv ? (
          <div className="msg-empty">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Elegí una conversación para ver los mensajes.</p>
          </div>
        ) : (
          <>
            <header className="msg-chat-head shadow-sm z-10">
              <Avatar user={activaConv.user} />
              <div className="msg-chat-head-info">
                <h3>{activaConv.user?.name || "Usuario"}</h3>
              </div>
            </header>
            <div className="msg-thread">
              {loadingChat ? (
                <Spinner />
              ) : activaMessages.length === 0 ? (
                <div className="text-center text-gray-500 p-8">No hay mensajes.</div>
              ) : (
                activaMessages.map((m) => (
                  <Burbuja
                    key={m.id}
                    m={m}
                    isMine={m.senderId === currentUserId}
                    user={activaConv.user}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="msg-composer border-t border-gray-100 bg-white" onSubmit={enviar}>
              <input
                type="text"
                placeholder="Escribí un mensaje..."
                aria-label="Escribí un mensaje"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={sending}
                className="flex-1"
              />
              <button
                type="submit"
                className="msg-send"
                aria-label="Enviar mensaje"
                disabled={!draft.trim() || sending}
              >
                {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
