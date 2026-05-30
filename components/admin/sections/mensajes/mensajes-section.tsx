"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, Search, Send, Smile } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import {
  getConversations,
  getMessages,
  markConversationRead,
  type Conversacion,
  type Mensaje,
} from "@/services/chat";
import {
  createWebSocketTransport,
  chatWsUrl,
  type ChatTransport,
} from "./chat-transport";
import { horaCorta, horaMensaje, initials } from "./format";
import type { SectionProps } from "../../admin-config";

type Filtro = "todos" | "usuario" | "interno";
type SubTab = "mensajes" | "perfil" | "evaluacion" | "notas";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "usuario", label: "Usuarios" },
  { id: "interno", label: "Internos" },
];

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "mensajes", label: "Mensajes" },
  { id: "perfil", label: "Perfil" },
  { id: "evaluacion", label: "Evaluación" },
  { id: "notas", label: "Notas" },
];

const PAGE = 30;

/** `transport` se puede inyectar en tests; en runtime usa el WebSocket real. */
export function MensajesSection({
  transport,
}: SectionProps & { transport?: ChatTransport } = {}) {
  const myUserId = useAppSelector((s) => s.user.id);

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Record<string, Mensaje[]>>({});
  const [hayMas, setHayMas] = useState<Record<string, boolean>>({});
  const [activaId, setActivaId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [query, setQuery] = useState("");
  const [subTab, setSubTab] = useState<SubTab>("mensajes");
  const [draft, setDraft] = useState("");
  const [cargando, setCargando] = useState(true);

  // Refs para que el listener del socket (suscrito una sola vez) lea lo actual.
  const activaIdRef = useRef<string | null>(null);
  activaIdRef.current = activaId;
  const myUserIdRef = useRef<number | undefined>(undefined);
  myUserIdRef.current = myUserId;
  const transportRef = useRef<ChatTransport | null>(null);

  // Carga inicial de conversaciones.
  useEffect(() => {
    getConversations().then((res) => {
      if (res.ok && res.data) {
        setConversaciones(res.data);
        if (res.data[0]) abrir(res.data[0].id);
      }
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Conexión al WebSocket y suscripción a mensajes entrantes.
  useEffect(() => {
    const t = transport ?? createWebSocketTransport(chatWsUrl());
    transportRef.current = t;

    const unsubscribe = t.subscribe(({ conversationId, message }) => {
      setMensajes((prev) =>
        prev[conversationId]
          ? { ...prev, [conversationId]: [...prev[conversationId], message] }
          : prev,
      );
      const esActiva = conversationId === activaIdRef.current;
      const esMio = message.senderUserId === myUserIdRef.current;
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessageAt: message.createdAt,
                noLeidos: esActiva || esMio ? 0 : c.noLeidos + 1,
              }
            : c,
        ),
      );
      if (esActiva && !esMio) markConversationRead(conversationId);
    });

    return () => {
      unsubscribe();
      if (!transport) t.close(); // sólo cerramos el socket que creamos nosotros
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Abre una conversación: carga la última página (si falta) y la marca leída. */
  function abrir(id: string) {
    setActivaId(id);
    setSubTab("mensajes");
    setConversaciones((prev) => prev.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c)));
    markConversationRead(id);
    setMensajes((prev) => {
      if (prev[id]) return prev;
      getMessages(id, { limit: PAGE }).then((res) => {
        if (res.ok && res.data) {
          setMensajes((m) => ({ ...m, [id]: res.data! }));
          setHayMas((h) => ({ ...h, [id]: res.data!.length === PAGE }));
        }
      });
      return prev;
    });
  }

  /** Carga la página anterior de mensajes (paginación hacia atrás). */
  function cargarAnteriores() {
    if (!activaId) return;
    const actuales = mensajes[activaId] ?? [];
    const before = actuales[0]?.createdAt;
    getMessages(activaId, { limit: PAGE, before }).then((res) => {
      if (!res.ok || !res.data) return;
      setMensajes((m) => ({ ...m, [activaId]: [...res.data!, ...(m[activaId] ?? [])] }));
      setHayMas((h) => ({ ...h, [activaId]: res.data!.length === PAGE }));
    });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = draft.trim();
    if (!texto || !activaId) return;
    // No lo agregamos a mano: vuelve por el socket (eco del servidor).
    transportRef.current?.send(activaId, texto);
    setDraft("");
  }

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversaciones.filter((c) => {
      if (filtro !== "todos" && c.canal !== filtro) return false;
      if (!q) return true;
      return c.nombre.toLowerCase().includes(q) || c.contexto.toLowerCase().includes(q);
    });
  }, [conversaciones, filtro, query]);

  const activa = conversaciones.find((c) => c.id === activaId) ?? null;
  const hilo = activaId ? mensajes[activaId] ?? [] : [];
  const esMio = (m: Mensaje) => m.senderUserId != null && m.senderUserId === myUserId;

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

        <ul className="msg-list">
          {!cargando && visibles.length === 0 && (
            <li className="msg-empty-list">No hay conversaciones.</li>
          )}
          {visibles.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`msg-item${c.id === activaId ? " is-active" : ""}`}
                onClick={() => abrir(c.id)}
                aria-current={c.id === activaId}
              >
                <span className="msg-avatar" aria-hidden>
                  {initials(c.nombre)}
                </span>
                <span className="msg-item-body">
                  <span className="msg-item-name">{c.nombre}</span>
                  <span className="msg-item-sub">{c.contexto}</span>
                </span>
                <span className="msg-item-meta">
                  <span className="msg-item-time">{horaCorta(c.lastMessageAt)}</span>
                  {c.noLeidos > 0 && (
                    <span className="msg-unread" aria-label={`${c.noLeidos} sin leer`}>
                      {c.noLeidos}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ---- Columna derecha: conversación activa ---- */}
      <section className="msg-chat-panel" aria-label="Conversación">
        {!activa ? (
          <div className="msg-empty">
            {cargando ? "Cargando conversaciones…" : "Elegí una conversación para ver los mensajes."}
          </div>
        ) : (
          <>
            <header className="msg-chat-head">
              <span className="msg-avatar" aria-hidden>
                {initials(activa.nombre)}
              </span>
              <div className="msg-chat-head-info">
                <h3>{activa.nombre}</h3>
                <p>{activa.asunto}</p>
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
                  {hayMas[activa.id] && (
                    <button type="button" className="msg-load-more" onClick={cargarAnteriores}>
                      Ver mensajes anteriores
                    </button>
                  )}
                  {hilo.map((m) => (
                    <div
                      key={m.id}
                      className={`msg-bubble-row ${esMio(m) ? "is-mine" : "is-theirs"}`}
                    >
                      {!esMio(m) && (
                        <span className="msg-avatar msg-avatar-sm" aria-hidden>
                          {initials(m.senderName)}
                        </span>
                      )}
                      <div className="msg-bubble">
                        <p>{m.texto}</p>
                        <time>{horaMensaje(m.createdAt)}</time>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="msg-composer" onSubmit={enviar}>
                  <input
                    type="text"
                    placeholder="Escribí un mensaje..."
                    aria-label="Escribí un mensaje"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button type="button" className="msg-icon-btn" aria-label="Emoji">
                    <Smile size={18} />
                  </button>
                  <button
                    type="submit"
                    className="msg-send"
                    aria-label="Enviar mensaje"
                    disabled={!draft.trim()}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : subTab === "perfil" ? (
              <div className="msg-detail">
                <dl className="msg-profile">
                  <div>
                    <dt>Email</dt>
                    <dd>{activa.perfil.email}</dd>
                  </div>
                  <div>
                    <dt>Teléfono</dt>
                    <dd>{activa.perfil.telefono}</dd>
                  </div>
                  <div>
                    <dt>Mascota</dt>
                    <dd>{activa.perfil.mascota}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="msg-detail msg-detail-empty">
                {subTab === "evaluacion"
                  ? "La evaluación de compatibilidad estará disponible próximamente."
                  : "Todavía no hay notas para esta conversación."}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
