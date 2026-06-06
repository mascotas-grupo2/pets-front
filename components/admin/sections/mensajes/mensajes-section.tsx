"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search, Send, Smile, Trash2 } from "lucide-react";
import {
  CONVERSACIONES,
  initials,
  type Conversacion,
  type SubTab,
} from "./mensajes.data";
import { ActionButton } from "../../ui/button";

type Filtro = "todos" | "usuario" | "interno";

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

/** Marca temporal "dd/mm/aaaa hh:mm" para los mensajes que se envían. */
function ahora(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function MensajesSection() {
  const [convs, setConvs] = useState<Conversacion[]>(CONVERSACIONES);
  const [activaId, setActivaId] = useState<string>(CONVERSACIONES[0]?.id ?? "");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [query, setQuery] = useState("");
  const [subTab, setSubTab] = useState<SubTab>("mensajes");
  const [draft, setDraft] = useState("");

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return convs.filter((c) => {
      if (filtro !== "todos" && c.canal !== filtro) return false;
      if (!q) return true;
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.contexto.toLowerCase().includes(q)
      );
    });
  }, [convs, filtro, query]);

  const activa = convs.find((c) => c.id === activaId) ?? null;

  /** Abre una conversación y la marca como leída. */
  function abrir(id: string) {
    setActivaId(id);
    setSubTab("mensajes");
    setConvs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c)),
    );
  }

  /** Agrega el mensaje del admin a la conversación activa (optimista, local). */
  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = draft.trim();
    if (!texto || !activa) return;
    setConvs((prev) =>
      prev.map((c) =>
        c.id === activa.id
          ? {
              ...c,
              mensajes: [
                ...c.mensajes,
                {
                  id: `m${c.mensajes.length + 1}`,
                  autor: "yo",
                  texto,
                  hora: ahora(),
                },
              ],
            }
          : c,
      ),
    );
    setDraft("");
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
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: "1rem"}}
        >
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              /* abrir modal nueva conversación */
            }}
          >
            + Nueva
          </button>
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
        </div>

        <ul className="msg-list">
          <div className="msg-list-header"></div>
          {visibles.length === 0 && (
            <li className="msg-empty-list">No hay conversaciones.</li>
          )}
          {visibles.map((c) => (
            <li key={c.id} className="msg-list-item-wrap">
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
                  <span className="msg-item-time">{c.hora}</span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: "row",
                    }}
                  >
                    <ActionButton
                      icon={Trash2}
                      onClick={() =>
                        setConvs((prev) =>
                          prev.filter((conv) => conv.id !== c.id),
                        )
                      }
                      ariaLabel="Eliminar conversación"
                      title="Eliminar"
                    />
                  </div>
                </span>
                {c.noLeidos > 0 && (
                  <span
                    className="msg-unread"
                    aria-label={`${c.noLeidos} sin leer`}
                  >
                    {c.noLeidos}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ---- Columna derecha: conversación activa ---- */}
      <section className="msg-chat-panel" aria-label="Conversación">
        {!activa ? (
          <div className="msg-empty">
            Elegí una conversación para ver los mensajes.
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
              <button
                type="button"
                className="msg-icon-btn"
                aria-label="Más opciones"
              >
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
                  {activa.mensajes.map((m) => (
                    <div
                      key={m.id}
                      className={`msg-bubble-row ${m.autor === "yo" ? "is-mine" : "is-theirs"}`}
                    >
                      {m.autor === "otro" && (
                        <span className="msg-avatar msg-avatar-sm" aria-hidden>
                          {initials(activa.nombre)}
                        </span>
                      )}
                      <div className="msg-bubble">
                        <p>{m.texto}</p>
                        <time>{m.hora}</time>
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
                  <button
                    type="button"
                    className="msg-icon-btn"
                    aria-label="Emoji"
                  >
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
