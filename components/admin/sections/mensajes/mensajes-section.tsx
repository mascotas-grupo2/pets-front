"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { MoreHorizontal, Search, Send, Smile, Loader2 } from "lucide-react";
import { initials, type SubTab } from "./mensajes.data";
import { getAdminInbox, getConversation, sendMessage, AdminInboxConversation, Message, ConversationProfile } from "@/services/messages.services";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";

type Filtro = "todos" | "usuario" | "interno";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "usuario", label: "Usuarios" },
  { id: "interno", label: "Internos" },
];

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "mensajes", label: "Mensajes" },
  { id: "perfil", label: "Perfil" },
];

export function MensajesSection() {
  const currentUser = useAppSelector((state) => state.user);
  const [inbox, setInbox] = useState<AdminInboxConversation[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  
  const [activaId, setActivaId] = useState<number | null>(null);
  const [activaMessages, setActivaMessages] = useState<Message[]>([]);
  const [activaProfile, setActivaProfile] = useState<ConversationProfile | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [query, setQuery] = useState("");
  const [subTab, setSubTab] = useState<SubTab>("mensajes");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 15000);
    return () => clearInterval(interval);
  }, []);

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
      const res = await getAdminInbox(1, 50); // Get up to 50 conversations for now
      if (res.ok && res.data) {
        setInbox(res.data.conversations);
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
        setActivaProfile(res.data.profile || null);
        
        // Mark as read in the local inbox state so the badge disappears
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
    return inbox.filter((c) => {
      // Very basic filtering based on role if available
      if (filtro === "interno" && c.user?.role !== "admin") return false;
      if (filtro === "usuario" && c.user?.role === "admin") return false;
      
      if (!q) return true;
      return c.user?.name?.toLowerCase().includes(q) || c.user?.email?.toLowerCase().includes(q) || c.latestMessage?.content?.toLowerCase().includes(q);
    });
  }, [inbox, filtro, query]);

  const activaConv = inbox.find((c) => c.user?.id === activaId) ?? null;

  function abrir(id: number) {
    if (id === activaId) return;
    setActivaId(id);
    setSubTab("mensajes");
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
        fetchInbox(); // Refresh inbox to update latest message
      } else {
        toast.error("No se pudo enviar el mensaje");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="msg">
      {/* ---- Columna izquierda: lista de conversaciones ---- */}
      <aside className="msg-list-panel" aria-label="Conversaciones">
        <div className="msg-tabs" role="tablist">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filtro === f.id}
              className={`msg-tab${filtro === f.id ? " is-active" : ""}`}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="admin-search msg-search">
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
              const name = u?.name || "Usuario Desconocido";
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
                      <span className="msg-item-sub truncate w-40">
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
          <div className="msg-empty">Elegí una conversación para ver los mensajes.</div>
        ) : (
          <>
            <header className="msg-chat-head">
              {activaConv.user?.photo ? (
                <img src={activaConv.user.photo} alt={activaConv.user.name} className="msg-avatar object-cover" />
              ) : (
                <span className="msg-avatar" aria-hidden>
                  {initials(activaConv.user?.name || "U")}
                </span>
              )}
              <div className="msg-chat-head-info">
                <h3>{activaConv.user?.name || "Usuario"}</h3>
                <p>{activaConv.user?.email || "Sin email"}</p>
              </div>
              <button type="button" className="msg-icon-btn" aria-label="Más opciones">
                <MoreHorizontal size={18} />
              </button>
            </header>

            <div className="msg-subtabs" role="tablist">
              {SUBTABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={subTab === t.id}
                  className={`msg-subtab${subTab === t.id ? " is-active" : ""}`}
                  onClick={() => setSubTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {subTab === "mensajes" ? (
              <>
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

                <form className="msg-composer" onSubmit={enviar}>
                  <input
                    type="text"
                    placeholder="Escribí un mensaje..."
                    aria-label="Escribí un mensaje"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={sending}
                  />
                  <button type="button" className="msg-icon-btn" aria-label="Emoji">
                    <Smile size={18} />
                  </button>
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
            ) : subTab === "perfil" ? (
              <div className="msg-detail p-6">
                <dl className="msg-profile space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500 font-medium">Email</dt>
                    <dd className="col-span-2 text-gray-900">{activaConv.user?.email || "—"}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500 font-medium">Estado del Perfil</dt>
                    <dd className="col-span-2">
                      {activaProfile?.status ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          activaProfile.status?.toLowerCase() === 'activo' ? 'bg-green-100 text-green-700' :
                          activaProfile.status?.toLowerCase() === 'bloqueado' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {activaProfile.status}
                        </span>
                      ) : "—"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                    <dt className="text-gray-500 font-medium">Notas de Evaluación</dt>
                    <dd className="col-span-2 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {activaProfile?.evaluationNote || <span className="italic text-gray-400">Sin notas de evaluación.</span>}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
