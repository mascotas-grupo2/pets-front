"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Search,
  Send,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import type {
  InboxConversation,
  Message,
  userMessage,
} from "@/services/messages.services";
import { useMessages } from "./useMessages";
import { initials } from "./messages.data";
import { NuevoMensaje } from "./nuevo-mensaje";

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

function Burbuja({
  m,
  isMine,
  user,
  isAdmin,
  onDelete,
}: {
  m: Message;
  isMine: boolean;
  user: userMessage | null;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}) {
  return (
    <div className={`msg-bubble-row ${isMine ? "is-mine" : "is-theirs"}`}>
      {!isMine && <Avatar user={user} small />}
      <div className="msg-bubble">
        {m.photo && (
          <div className="msg-bubble-photo">
            <img src={m.photo} alt="Foto adjunta" />
          </div>
        )}
        {m.content && <p>{m.content}</p>}
        <time>
          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
      {(isMine || isAdmin) && (
        <button
          type="button"
          className="msg-delete"
          aria-label="Eliminar mensaje"
          title="Eliminar mensaje"
          onClick={() => onDelete(m.id)}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Bandeja de conversaciones + chat activo contra la API real de mensajes.
 * Lo usan la sección Mensajes del admin y la pestaña Mensajes de la cuenta.
 */
export function MessagesPanel({ initialUserId }: { initialUserId?: number }) {
  const {
    isLoggedIn,
    currentUserId,
    isAdmin,
    loadingInbox,
    activaId,
    activaMessages,
    loadingChat,
    query,
    setQuery,
    draft,
    setDraft,
    photoFile,
    setPhotoFile,
    sending,
    visibles,
    activaUser,
    abrir,
    abrirConUsuario,
    enviar,
    eliminar,
  } = useMessages();

  const [showNuevo, setShowNuevo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activaMessages]);

  // Abrir directo una conversación cuando se llega con ?user=<id> (ej. desde una
  // notificación de mensaje). Esperamos a que esa conversación esté en la bandeja.
  const openedRef = useRef(false);
  useEffect(() => {
    if (
      initialUserId &&
      !openedRef.current &&
      visibles.some((c) => c.user?.id === initialUserId)
    ) {
      openedRef.current = true;
      abrir(initialUserId);
    }
  }, [initialUserId, visibles, abrir]);

  if (!isLoggedIn) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-lg m-4">
        Debes iniciar sesión para ver tus mensajes.
      </div>
    );
  }

  return (
    <div className="msg-layout">
      {/* ---- Columna izquierda: lista de conversaciones ---- */}
      <aside className="msg-list-panel" aria-label="Conversaciones">
        <div className="msg-panel-head">
          <div className="msg-panel-title">
            <span className="msg-panel-icon" aria-hidden>
              <MessageSquare size={18} />
            </span>
            <div>
              <h3>Mensajes</h3>
              <p>Tus conversaciones</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowNuevo(true)}
          >
            <Plus size={15} aria-hidden /> Nuevo
          </button>
        </div>
        <div className="admin-search msg-search msg-search-block">
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
                      <span className="msg-item-sub truncate w-32">
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
        {!activaId || !activaUser ? (
          <div className="msg-empty">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Elegí una conversación o empezá una nueva.</p>
          </div>
        ) : (
          <>
            <header className="msg-chat-head">
              <Avatar user={activaUser} />
              <div className="msg-chat-head-info">
                <h3>{activaUser?.name || "Usuario"}</h3>
              </div>
            </header>
            <div className="msg-thread">
              {loadingChat ? (
                <Spinner />
              ) : activaMessages.length === 0 ? (
                <div className="text-center text-gray-500 p-8">
                  No hay mensajes. Escribí el primero.
                </div>
              ) : (
                activaMessages.map((m) => (
                  <Burbuja
                    key={m.id}
                    m={m}
                    isMine={m.senderId === currentUserId}
                    user={activaUser}
                    isAdmin={isAdmin}
                    onDelete={eliminar}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="msg-composer" onSubmit={enviar}>
              {photoFile && (
                <div className="msg-preview-container">
                  <div className="msg-preview-box">
                    <img 
                      src={URL.createObjectURL(photoFile)} 
                      alt="Preview" 
                      className="msg-preview-img" 
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoFile(null)}
                      className="msg-preview-close"
                      aria-label="Quitar foto"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPhotoFile(e.target.files[0]);
                  }
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className="msg-attach-btn"
                aria-label="Adjuntar foto"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                placeholder="Escribí un mensaje..."
                aria-label="Escribí un mensaje"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="msg-send"
                aria-label="Enviar mensaje"
                disabled={(!draft.trim() && !photoFile) || sending}
              >
                {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </section>

      {showNuevo && (
        <NuevoMensaje
          currentUserId={currentUserId}
          mode={isAdmin ? "all" : "admins"}
          onSelect={(user) => {
            abrirConUsuario(user);
            setShowNuevo(false);
          }}
          onClose={() => setShowNuevo(false)}
        />
      )}
    </div>
  );
}
