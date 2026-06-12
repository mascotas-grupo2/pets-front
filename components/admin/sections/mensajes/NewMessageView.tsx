"use client";

import { ArrowLeft, Loader2, Search, Send, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNewMessage, UserItem } from "../hook/messages/useNewMessage";
import { initials } from "../dashboard/dashboard.data";

type Props = {
  inboxUserIds: number[];
  onCancel: () => void;
  onCreated: (user: UserItem) => void;
};

function Avatar({ u }: { u: UserItem }) {
  return u.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={u.photo} alt={u.name} className="msg-avatar msg-avatar-sm object-cover" />
  ) : (
    <span className="msg-avatar msg-avatar-sm">{initials(u.name)}</span>
  );
}

export default function NewMessageView({
  inboxUserIds,
  onCancel,
  onCreated,
}: Props) {
  const {
    search,
    setSearch,
    results,
    selectedUser,
    setSelectedUser,
    message,
    setMessage,
    loadingUsers,
    sendFirstMessage,
  } = useNewMessage(inboxUserIds);

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return toast.error("Seleccioná un destinatario");
    if (!message.trim()) return toast.error("Escribí un mensaje");
    const user = await sendFirstMessage();
    if (!user) return;
    toast.success(`Mensaje enviado a ${user.name}`);
    onCreated(user);
  }

  return (
    <section className="msg-chat-panel">
      <header className="msg-chat-head">
        <button type="button" className="vdrawer-close" onClick={onCancel} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div className="msg-chat-head-info">
          <h3>Nuevo mensaje</h3>
        </div>
      </header>

      <form className="nm-compose" onSubmit={handleSubmit}>
        {/* Destinatario */}
        <div className="nm-field">
          <label className="nm-label">Para</label>

          {selectedUser ? (
            <div className="nm-selected">
              <Avatar u={selectedUser} />
              <div className="nm-selected-info">
                <span className="nm-selected-name">{selectedUser.name}</span>
                {selectedUser.email && (
                  <span className="nm-selected-email">{selectedUser.email}</span>
                )}
              </div>
              <button
                type="button"
                className="nm-clear"
                aria-label="Cambiar destinatario"
                onClick={() => {
                  setSelectedUser(null);
                  setSearch("");
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="nm-search-wrap">
              <div className="admin-search msg-search">
                <Search size={16} />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Buscar usuario o admin…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {loadingUsers && <Loader2 className="animate-spin w-4 h-4 text-gray-400" />}
              </div>

              {results.length > 0 && (
                <ul className="nm-results">
                  {results.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        className="nm-result"
                        onClick={() => {
                          setSelectedUser(u);
                          setSearch(u.name);
                        }}
                      >
                        <Avatar u={u} />
                        <div className="nm-result-info">
                          <span className="nm-result-name">{u.name}</span>
                          {u.email && <span className="nm-result-email">{u.email}</span>}
                        </div>
                        <span className={`nm-role nm-role--${u.role ?? "user"}`}>
                          {u.role === "admin" ? "Admin" : "Usuario"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!loadingUsers && search.trim().length > 1 && results.length === 0 && (
                <p className="nm-empty-hint">No se encontraron personas.</p>
              )}
            </div>
          )}
        </div>

        {/* Mensaje */}
        <div className="nm-field nm-field--grow">
          <label className="nm-label">Mensaje</label>
          <textarea
            className="nm-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!selectedUser}
            placeholder={
              selectedUser
                ? `Escribí un mensaje para ${selectedUser.name}...`
                : "Primero elegí un destinatario."
            }
          />
        </div>

        <div className="nm-foot">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!selectedUser || !message.trim()}
          >
            <Send size={14} /> Enviar
          </button>
        </div>
      </form>
    </section>
  );
}
