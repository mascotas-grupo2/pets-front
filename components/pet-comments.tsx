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
import { Check, X, SendHorizonal, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffDays = Math.floor((Date.now() - then) / 86_400_000);
  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `Hace ${Math.floor(diffDays / 7)} sem.`;
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

  const loadComments = async () => {
    setLoading(true);
    try {
      if (isOwner) {
        const res = await getOwnerComments(petId);
        if (res?.ok && res.data) setComments(res.data);
      } else {
        const res = await getApprovedComments(petId);
        if (res?.ok && res.data) setComments(res.data);
      }
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
        setSuccessMsg("¡Comentario enviado! El creador del reporte lo revisará antes de publicarlo.");
        setText("");
        if (isOwner) {
          // Si el dueño comenta en su propia publicación, se aprueba automáticamente
          loadComments();
        }
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

  return (
    <section className="pet-comments">
      <div className="section-title">
        <h2>
          <MessageSquare size={20} aria-hidden /> Comentarios
        </h2>
        <p>Dejá tu comentario o experiencia. El creador del reporte lo revisará antes de publicarlo.</p>
      </div>

      {/* Formulario para dejar comentario */}
      <form className="comment-form" onSubmit={handleSubmit}>
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
        <textarea
          className="input comment-textarea"
          rows={3}
          placeholder="Escribí tu comentario… ¿viste a esta mascota? ¿Tenés alguna información? *"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <div className="comment-form-foot">
          {successMsg && (
            <span className="comment-success">
              <Check size={14} aria-hidden /> {successMsg}
            </span>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !text.trim() || !authorName.trim()}
          >
            <SendHorizonal size={16} aria-hidden />
            {submitting ? "Enviando…" : "Enviar comentario"}
          </button>
        </div>
      </form>

      {/* Comentarios pendientes (solo visible para el owner) */}
      {isOwner && pending.length > 0 && (
        <div className="comment-pending-section">
          <h3>
            <Clock size={16} aria-hidden /> Comentarios pendientes de aprobación
          </h3>
          <ul className="comment-list">
            {pending.map((c) => (
              <li key={c.id} className="comment-item comment-item--pending">
                <div className="comment-head">
                  <strong>{c.authorName}</strong>
                  {c.authorEmail && (
                    <span className="comment-email">{c.authorEmail}</span>
                  )}
                  <span className="comment-time">{relativeTime(c.createdAt)}</span>
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

      {/* Comentarios aprobados */}
      {loading ? (
        <p className="comment-loading">Cargando comentarios…</p>
      ) : approved.length === 0 ? (
        <div className="comment-empty">
          <AlertCircle size={24} aria-hidden />
          <p>
            {isOwner && pending.length === 0
              ? "Todavía no hay comentarios. Cuando alguien comente, aparecerán aquí para que los apruebes."
              : "No hay comentarios todavía. ¡Sé el primero en comentar!"}
          </p>
        </div>
      ) : (
        <ul className="comment-list">
          {approved.map((c) => (
            <li key={c.id} className="comment-item">
              <div className="comment-head">
                <div className="comment-avatar">
                  {c.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{c.authorName}</strong>
                  <span className="comment-time">{relativeTime(c.createdAt)}</span>
                </div>
              </div>
              <p className="comment-text">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
