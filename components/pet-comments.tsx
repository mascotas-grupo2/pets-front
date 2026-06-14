"use client";

import { useAppSelector } from "@/redux/hooks";
import {
  getApprovedComments,
  getOwnerComments,
  createComment,
  approveComment,
  rejectComment,
} from "@/services/pet-comments";
import { PetComment } from "@/types/pet-comment";
import {
  Check,
  X,
  SendHorizonal,
  MessageSquare,
  Clock,
  MessagesSquare,
} from "lucide-react";
import { useEffect, useState } from "react";

const MAX_LEN = 500;

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffDays = Math.floor((Date.now() - then) / 86_400_000);
  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `Hace ${Math.floor(diffDays / 7)} sem.`;
}

/** Color determinístico a partir del nombre, para que cada autor tenga su tono. */
function avatarHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const hue = avatarHue(name || "?");
  return (
    <div
      className="comment-avatar"
      style={{
        width: size,
        height: size,
        background: `hsl(${hue} 70% 92%)`,
        color: `hsl(${hue} 55% 38%)`,
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

export function PetComments({ petId }: { petId: string }) {
  const user = useAppSelector((state) => state.user);
  const pet = useAppSelector((state) => state.pet);
  const isOwner = !!user.isLoggedIn && user.id != null && pet?.userId === user.id;

  const [comments, setComments] = useState<PetComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState(user.name ?? "");
  const [authorEmail, setAuthorEmail] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [focused, setFocused] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = isOwner
        ? await getOwnerComments(petId)
        : await getApprovedComments(petId);
      if (res?.ok && res.data) setComments(res.data);
    } catch {
      /* silencio */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petId) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId, isOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !authorName.trim()) return;
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await createComment(petId, {
        authorName: authorName.trim(),
        text: text.trim(),
        authorEmail: authorEmail.trim() || undefined,
      });
      if (res?.ok) {
        setSuccessMsg(
          "¡Comentario enviado! El creador del reporte lo revisará antes de publicarlo.",
        );
        setText("");
        if (isOwner) loadComments();
      }
    } catch {
      /* error */
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    const res = await approveComment(petId, commentId);
    if (res?.ok) loadComments();
  };

  const handleReject = async (commentId: string) => {
    const res = await rejectComment(petId, commentId);
    if (res?.ok) loadComments();
  };

  const approved = comments.filter((c) => c.status === "approved");
  const pending = comments.filter((c) => c.status === "pending");
  const remaining = MAX_LEN - text.length;
  const canSubmit = !submitting && text.trim().length > 0 && authorName.trim().length > 0;

  return (
    <section className="pet-comments">
      <header className="comment-header">
        <h2>
          <span className="comment-header-icon" aria-hidden>
            <MessageSquare size={18} />
          </span>
          Comentarios
          {approved.length > 0 && (
            <span className="comment-count" aria-label={`${approved.length} comentarios`}>
              {approved.length}
            </span>
          )}
        </h2>
        <p>
          Dejá tu comentario o experiencia. El creador del reporte lo revisará
          antes de publicarlo.
        </p>
      </header>

      <form
        className={`comment-form${focused ? " is-focused" : ""}`}
        onSubmit={handleSubmit}
      >
        <div className="comment-form-identity">
          {user.isLoggedIn ? (
            <div className="comment-identity-chip">
              <Avatar name={authorName} size={30} />
              <span>
                Comentás como <strong>{authorName || "vos"}</strong>
              </span>
            </div>
          ) : (
            <div className="comment-form-row">
              <input
                className="input"
                type="text"
                placeholder="Tu nombre *"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
              <input
                className="input"
                type="email"
                placeholder="Tu email (opcional)"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="comment-textarea-wrap">
          <textarea
            className="input comment-textarea"
            rows={focused || text ? 4 : 3}
            maxLength={MAX_LEN}
            placeholder="Escribí tu comentario… ¿viste a esta mascota? ¿Tenés alguna información? *"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required
          />
          <span
            className={`comment-counter${remaining < 50 ? " is-low" : ""}`}
            aria-hidden
          >
            {text.length}/{MAX_LEN}
          </span>
        </div>

        <div className="comment-form-foot">
          {successMsg && (
            <span className="comment-success" role="status">
              <Check size={14} aria-hidden /> {successMsg}
            </span>
          )}
          <button
            type="submit"
            className="btn btn-primary comment-submit"
            disabled={!canSubmit}
          >
            <SendHorizonal size={16} aria-hidden className="comment-submit-icon" />
            {submitting ? "Enviando…" : "Enviar comentario"}
          </button>
        </div>
      </form>

      {isOwner && pending.length > 0 && (
        <div className="comment-pending-section">
          <h3>
            <Clock size={16} aria-hidden /> Pendientes de aprobación
            <span className="comment-pending-badge">{pending.length}</span>
          </h3>
          <ul className="comment-list">
            {pending.map((c, i) => (
              <li
                key={c.id}
                className="comment-item comment-item--pending comment-enter"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="comment-head">
                  <Avatar name={c.authorName} size={34} />
                  <div className="comment-head-meta">
                    <strong>{c.authorName}</strong>
                    {c.authorEmail && (
                      <span className="comment-email">{c.authorEmail}</span>
                    )}
                    <span className="comment-time">{relativeTime(c.createdAt)}</span>
                  </div>
                </div>
                <p className="comment-text">{c.text}</p>
                <div className="comment-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleApprove(c.id)}
                    title="Aprobar comentario"
                  >
                    <Check size={14} aria-hidden /> Aprobar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => handleReject(c.id)}
                    title="Rechazar comentario"
                  >
                    <X size={14} aria-hidden /> Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <ul className="comment-list" aria-hidden>
          {[0, 1].map((i) => (
            <li key={i} className="comment-item comment-skeleton">
              <div className="comment-head">
                <span className="skeleton skeleton-avatar" />
                <div className="comment-head-meta" style={{ flex: 1 }}>
                  <span className="skeleton skeleton-line" style={{ width: "30%" }} />
                  <span className="skeleton skeleton-line" style={{ width: "18%" }} />
                </div>
              </div>
              <span className="skeleton skeleton-line" style={{ width: "90%" }} />
              <span className="skeleton skeleton-line" style={{ width: "70%" }} />
            </li>
          ))}
        </ul>
      ) : approved.length === 0 ? (
        <div className="comment-empty">
          <span className="comment-empty-icon" aria-hidden>
            <MessagesSquare size={28} />
          </span>
          <p>
            {isOwner && pending.length === 0
              ? "Todavía no hay comentarios. Cuando alguien comente, aparecerán aquí para que los apruebes."
              : "No hay comentarios todavía. ¡Sé el primero en comentar!"}
          </p>
        </div>
      ) : (
        <ul className="comment-list">
          {approved.map((c, i) => {
            const fromOwner =
              pet?.userId != null && (c as { userId?: number }).userId === pet.userId;
            return (
              <li
                key={c.id}
                className="comment-item comment-enter"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="comment-head">
                  <Avatar name={c.authorName} />
                  <div className="comment-head-meta">
                    <strong>
                      {c.authorName}
                      {fromOwner && (
                        <span className="comment-owner-badge">Publicó el reporte</span>
                      )}
                    </strong>
                    <span className="comment-time">{relativeTime(c.createdAt)}</span>
                  </div>
                </div>
                <p className="comment-text">{c.text}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
