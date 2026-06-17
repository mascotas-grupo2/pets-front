"use client";

import {
  Loader2,
  Send,
  Trash2,
  CheckCircle2,
  ArrowDown,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { userMessage } from "@/services/messages.services";
import { useConversation } from "../hook/messages/useConversation";
import { useEvaluacion } from "../hook/useEvaluacion";
import { initials } from "../dashboard/dashboard.data";
import { Avatar, Burbuja, Spinner } from "@/components/messages/chat-ui";

type Props = {
  conversationData: ReturnType<typeof useConversation>;
  activeUserMessage: userMessage | null;
};

type Tab = "mensajes" | "perfil" | "evaluacion";

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="vdrawer-field">
      <span className="vdrawer-field-label">{label}</span>
      <span className="vdrawer-field-value">{value || "—"}</span>
    </div>
  );
}

/** Pestaña Evaluación (checklist + impresiones), persistida por solicitud. */
function TabEvaluacion({
  adoptionId,
  evaluationNote,
  petNotes,
}: {
  adoptionId?: number | null;
  evaluationNote?: string | null;
  petNotes?: { id: string; text: string; author: string | null; createdAt: string }[];
}) {
  const { items, checked, notes, toggle, addNote, disabled } =
    useEvaluacion(adoptionId);
  const [nota, setNota] = useState("");

  async function guardar() {
    const ok = await addNote(nota);
    if (ok) setNota("");
  }

  const fecha = (d: string) =>
    new Date(d).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="msg-tab-content msg-eval">
      {evaluationNote && (
        <div className="msg-eval-block">
          <p className="msg-section-label">Evaluación del adoptante</p>
          <p className="msg-eval-note">{evaluationNote}</p>
        </div>
      )}

      {disabled && (
        <p className="msg-tab-empty">
          Este usuario todavía no tiene una solicitud para evaluar.
        </p>
      )}

      <div className="msg-eval-block">
        <p className="msg-section-label">
          Checklist
          <span className="msg-check-count">
            {checked.length}/{items.length}
          </span>
        </p>
        <div className="msg-chips">
          {items.map((item) => {
            const on = checked.includes(item);
            return (
              <button
                key={item}
                type="button"
                className={`msg-chip-check${on ? " is-checked" : ""}`}
                onClick={() => toggle(item)}
                disabled={disabled}
              >
                {on && <CheckCircle2 size={13} aria-hidden />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="msg-eval-block">
        <p className="msg-section-label">Impresiones</p>
        <div className="msg-nota-composer">
          <textarea
            className="input"
            placeholder="Anotá una impresión o comentario..."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={3}
            style={{ resize: "none" }}
            disabled={disabled}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={guardar}
            disabled={disabled || !nota.trim()}
          >
            Guardar
          </button>
        </div>
        {notes.length > 0 && (
          <ul className="msg-notes">
            {notes.map((n) => (
              <li key={n.id} className="msg-note">
                <p>{n.text}</p>
                <span className="msg-note-meta">
                  {n.author ? `${n.author} · ` : ""}
                  {fecha(n.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {petNotes && petNotes.length > 0 && (
        <div className="msg-eval-block">
          <p className="msg-section-label">Notas de la mascota</p>
          <ul className="msg-notes">
            {petNotes.map((n) => (
              <li key={n.id} className="msg-note">
                <p>{n.text}</p>
                <span className="msg-note-meta">
                  {n.author ? `${n.author} · ` : ""}
                  {fecha(n.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ConversationView({
  conversationData,
  activeUserMessage,
}: Props) {
  const currentUser = useAppSelector((state) => state.user);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("mensajes");
  const [newCount, setNewCount] = useState(0);

  const { messages, profile, hasMore, loadingOlder, loadOlder } = conversationData;
  const esInterno = activeUserMessage?.role === "admin";
  // Si el solicitante no está en la bandeja (nunca escribió), usamos el perfil
  // que devuelve la conversación para mostrar nombre/foto igual.
  const headName = activeUserMessage?.name || profile?.name || "Usuario";
  const headPhoto = activeUserMessage?.photo || profile?.photo || null;

  // Conversación admin↔admin: solo Mensajes + Perfil. Con usuario: + Evaluación
  // (la Evaluación concentra checklist, impresiones y notas de la mascota).
  const tabs: { id: Tab; label: string }[] = useMemo(
    () =>
      esInterno
        ? [
            { id: "mensajes", label: "Mensajes" },
            { id: "perfil", label: "Perfil" },
          ]
        : [
            { id: "mensajes", label: "Mensajes" },
            { id: "perfil", label: "Perfil" },
            { id: "evaluacion", label: "Evaluación" },
          ],
    [esInterno],
  );

  // Si cambiamos de conversación y la pestaña activa ya no existe, volvemos a Mensajes.
  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab("mensajes");
  }, [tabs, tab]);

  const threadRef = useRef<HTMLDivElement>(null);
  const prevLastIdRef = useRef<number | null>(null);
  const atBottomRef = useRef(true);

  function isAtBottom() {
    const el = threadRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }
  function scrollToBottom(smooth = true) {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setNewCount(0);
  }

  // Auto-scroll en mensaje nuevo si estás abajo; si no, badge de "nuevos".
  useEffect(() => {
    if (tab !== "mensajes") return;
    const el = threadRef.current;
    if (!el) return;
    const lastId = messages.length ? messages[messages.length - 1].id : null;
    const prev = prevLastIdRef.current;

    if (prev === null) {
      el.scrollTop = el.scrollHeight; // carga inicial → abajo
    } else if (lastId !== prev) {
      if (atBottomRef.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      else setNewCount((c) => c + 1);
    }
    prevLastIdRef.current = lastId;
  }, [messages, tab]);

  async function onThreadScroll() {
    const el = threadRef.current;
    if (!el) return;
    atBottomRef.current = isAtBottom();
    if (atBottomRef.current && newCount) setNewCount(0);

    // Scroll arriba → cargar más viejos manteniendo la posición.
    if (el.scrollTop < 60 && hasMore && !loadingOlder) {
      const prevHeight = el.scrollHeight;
      const n = await loadOlder();
      if (n > 0) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevHeight;
        });
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text && !photoFile) return;
    setSending(true);
    const ok = await conversationData.send(text, photoFile);
    if (ok) {
      setDraft("");
      setPhotoFile(null);
      setTimeout(() => scrollToBottom(), 50);
    }
    setSending(false);
  }

  return (
    <section className="msg-chat-panel">
      <header className="msg-chat-head">
        <Avatar user={{ name: headName, photo: headPhoto } as any} />
        <div className="msg-chat-head-info">
          <h3>{headName}</h3>
          {(profile?.context || activeUserMessage?.context) && (
            <p>{profile?.context ?? activeUserMessage?.context}</p>
          )}
        </div>
      </header>

      <div className="msg-tabs msg-chat-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`msg-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mensajes" && (
        <>
          <div className="msg-thread-wrap">
            <div className="msg-thread" ref={threadRef} onScroll={onThreadScroll}>
              {loadingOlder && (
                <div className="msg-older-loader">
                  <Loader2 className="animate-spin" size={16} /> Cargando…
                </div>
              )}
              {conversationData.loading ? (
                <Spinner />
              ) : messages.length === 0 ? (
                <div className="text-center p-8 text-gray-500">No hay mensajes.</div>
              ) : (
                messages.map((m) => {
                  return (
                    <Burbuja
                      key={m.id}
                      m={m}
                      isMine={m.senderId === currentUser.id}
                      user={activeUserMessage}
                      isAdmin={currentUser.role === "admin"}
                      onDelete={conversationData.remove}
                    />
                  );
                })
              )}
            </div>

            {newCount > 0 && (
              <button
                type="button"
                className="msg-new-badge"
                onClick={() => scrollToBottom()}
              >
                <ArrowDown size={14} /> {newCount} mensaje{newCount > 1 ? "s" : ""} nuevo
                {newCount > 1 ? "s" : ""}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="msg-composer">
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
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribí un mensaje..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={(!draft.trim() && !photoFile) || sending}
              className="msg-send"
            >
              {sending ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </>
      )}

      {tab === "perfil" && (
        <div className="msg-tab-content">
          <div className="vdrawer-section">
            <Campo label="Nombre" value={profile?.name ?? activeUserMessage?.name} />
            <Campo label="Email" value={profile?.email ?? activeUserMessage?.email} />
            {!esInterno && (
              <>
                <Campo label="Teléfono" value={profile?.phone} />
                <Campo label="Localidad" value={profile?.town} />
                <Campo label="Estado" value={profile?.status} />
                <Campo label="Solicitud" value={profile?.context} />
              </>
            )}
            {esInterno && <Campo label="Rol" value="Administrador (interno)" />}
          </div>
        </div>
      )}

      {tab === "evaluacion" && !esInterno && (
        <TabEvaluacion
          adoptionId={profile?.adoptionId}
          evaluationNote={profile?.evaluationNote}
          petNotes={profile?.notes}
        />
      )}
    </section>
  );
}
