"use client";

import { ArrowLeft, Loader2, Search, Send } from "lucide-react";

import { useRef, useEffect } from "react";
import { toast } from "sonner";
import { useNewMessage, UserItem } from "../hook/messages/useNewMessage";
import { initials } from "../dashboard/dashboard.data";

type Props = {
  inboxUserIds: number[];

  onCancel: () => void;

  onCreated: (user: UserItem) => void;
};

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

    if (!selectedUser) {
      toast.error("Seleccioná un destinatario");
      return;
    }

    if (!message.trim()) {
      toast.error("Escribí un mensaje");
      return;
    }

    const user = await sendFirstMessage();

    if (!user) {
      return;
    }

    toast.success(`Mensaje enviado a ${user.name}`);

    onCreated(user);
  }

  return (
    <section className="msg-chat-panel">
      {/* Header */}
      <header className="msg-chat-head border-b border-gray-100">
        <button
          type="button"
          className="msg-icon-btn"
          onClick={onCancel}
          aria-label="Volver"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="msg-chat-head-info">
          <h3>Nuevo mensaje</h3>
        </div>
      </header>

      {/* Destinatario */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Para
        </label>

        <div className="relative">
          <div className="admin-search msg-search">
            <Search size={16} />

            <input
              ref={searchRef}
              type="search"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);

                if (selectedUser) {
                  setSelectedUser(null);
                }
              }}
            />

            {loadingUsers && (
              <Loader2 className="animate-spin w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* Resultados */}
          {!selectedUser && results.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {results.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      setSelectedUser(u);

                      setSearch(u.name);
                    }}
                  >
                    {u.photo ? (
                      <img
                        src={u.photo}
                        alt={u.name}
                        className="msg-avatar msg-avatar-sm object-cover"
                      />
                    ) : (
                      <span className="msg-avatar msg-avatar-sm">
                        {initials(u.name)}
                      </span>
                    )}

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {u.name}
                      </span>

                      {u.email && (
                        <span className="text-xs text-gray-400 truncate">
                          {u.email}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Usuario seleccionado */}
          {selectedUser && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-blue-50 border border-blue-100 p-2">
              {selectedUser.photo ? (
                <img
                  src={selectedUser.photo}
                  alt={selectedUser.name}
                  className="msg-avatar msg-avatar-sm object-cover"
                />
              ) : (
                <span className="msg-avatar msg-avatar-sm">
                  {initials(selectedUser.name)}
                </span>
              )}

              <div className="flex flex-col">
                <span className="text-sm font-medium">{selectedUser.name}</span>

                {selectedUser.email && (
                  <span className="text-xs text-gray-500">
                    {selectedUser.email}
                  </span>
                )}
              </div>
            </div>
          )}

          {!loadingUsers &&
            search.trim().length > 1 &&
            !selectedUser &&
            results.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">
                No se encontraron usuarios.
              </p>
            )}
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Mensaje
        </label>

        <textarea
          rows={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!selectedUser}
          placeholder={
            selectedUser
              ? `Escribí un mensaje para ${selectedUser.name}...`
              : "Seleccioná un destinatario."
          }
          className="
            flex-1
            resize-none
            rounded-lg
            border
            border-gray-200
            p-3
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            disabled:bg-gray-50
            disabled:text-gray-400
          "
        />

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={!selectedUser || !message.trim()}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <Send size={14} />
            Enviar
          </button>
        </div>
      </form>
    </section>
  );
}
