"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { MoreHorizontal, Search, Send, Smile, Loader2, MessageSquare } from "lucide-react";
import { getInbox, getConversation, sendMessage, InboxResponse, Message, InboxConversation } from "@/services/messages.services";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { initials } from "@/components/admin/sections/mensajes/mensajes.data";

export default function MessagesPage() {
  const currentUser = useAppSelector((state) => state.user);
  const [inbox, setInbox] = useState<InboxConversation[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  
  const [activaId, setActivaId] = useState<number | null>(null);
  const [activaMessages, setActivaMessages] = useState<Message[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser.isLoggedIn) {
      setError("Debes iniciar sesión para ver tus mensajes.");
      setLoadingInbox(false);
      return;
    }
    
    fetchInbox();
    const interval = setInterval(fetchInbox, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (activaId) {
      fetchChat(activaId);
      const interval = setInterval(() => fetchChat(activaId, false), 5000);
      return () => clearInterval(interval);
    }
  }, [activaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activaMessages]);

  const fetchInbox = async () => {
    try {
      const res = await getInbox();
      if (res.ok && res.data) {
        setInbox(res.data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching inbox:", error);
    } finally {
      setLoadingInbox(false);
    }
  };

  const fetchChat = async (userId: number, showLoading = true) => {
    if (showLoading) setLoadingChat(true);
    try {
      const res = await getConversation(userId);
      if (res.ok && res.data) {
        setActivaMessages(res.data.messages || []);
        
        // Mark as read locally
        setInbox(prev => prev.map(c => 
          c.user?.id === userId ? { ...c, unread: 0 } : c
        ));
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      if (showLoading) setLoadingChat(false);
    }
  };

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inbox;
    return inbox.filter((c) => 
      c.user?.name?.toLowerCase().includes(q) || 
      c.latestMessage?.content?.toLowerCase().includes(q)
    );
  }, [inbox, query]);

  const activaConv = inbox.find((c) => c.user?.id === activaId) ?? null;

  function abrir(id: number) {
    if (id === activaId) return;
    setActivaId(id);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = draft.trim();
    if (!texto || !activaId || sending) return;
    
    setSending(true);
    try {
      const res = await sendMessage(activaId, texto);
      if (res.ok && res.data) {
        setActivaMessages(prev => [...prev, res.data!]);
        setDraft("");
        fetchInbox();
      } else {
        toast.error("No se pudo enviar el mensaje");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSending(false);
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-lg m-4">{error}</div>
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
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
        ) : (
          <ul className="msg-list">
            {visibles.length === 0 && (
              <li className="msg-empty-list">No hay conversaciones.</li>
            )}
            {visibles.map((c) => {
              const u = c.user;
              const isActiva = u?.id === activaId;
              const name = u?.name || "Usuario";
              return (
                <li key={u?.id || Math.random()}>
                  <button
                    type="button"
                    className={`msg-item${isActiva ? " is-active" : ""}`}
                    onClick={() => u && abrir(u.id)}
                    aria-current={isActiva}
                  >
                    {u?.photo ? (
                      <img src={u.photo} alt={name} className="msg-avatar object-cover" />
                    ) : (
                      <span className="msg-avatar" aria-hidden>
                        {initials(name)}
                      </span>
                    )}
                    
                    <span className="msg-item-body">
                      <span className="msg-item-name">{name}</span>
                      <span className="msg-item-sub truncate w-32 sm:w-40">
                        {c.latestMessage?.senderId === currentUser?.id ? "Tú: " : ""}
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
              {activaConv.user?.photo ? (
                <img src={activaConv.user.photo} alt={activaConv.user.name} className="msg-avatar object-cover" />
              ) : (
                <span className="msg-avatar" aria-hidden>
                  {initials(activaConv.user?.name || "U")}
                </span>
              )}
              <div className="msg-chat-head-info">
                <h3>{activaConv.user?.name || "Usuario"}</h3>
              </div>
            </header>

            <div className="msg-thread">
              {loadingChat ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
              ) : activaMessages.length === 0 ? (
                <div className="text-center text-gray-500 p-8">No hay mensajes.</div>
              ) : (
                activaMessages.map((m) => {
                  const isMine = m.senderId === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`msg-bubble-row ${isMine ? "is-mine" : "is-theirs"}`}
                    >
                      {!isMine && (
                        activaConv.user?.photo ? (
                          <img src={activaConv.user.photo} alt={activaConv.user.name} className="msg-avatar msg-avatar-sm object-cover" />
                        ) : (
                          <span className="msg-avatar msg-avatar-sm" aria-hidden>
                            {initials(activaConv.user?.name || "U")}
                          </span>
                        )
                      )}
                      <div className="msg-bubble">
                        <p>{m.content}</p>
                        <time>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    </div>
                  );
                })
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
