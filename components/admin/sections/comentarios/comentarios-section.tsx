"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X, MessageCircle } from "lucide-react";
import {
  getPendingComments,
  approveComment,
  rejectComment,
  type PendingComment,
} from "@/services/pet-comments";

/** Moderación centralizada: todos los comentarios pendientes de todas las publicaciones. */
export function ComentariosSection() {
  const [items, setItems] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await getPendingComments();
    if (res.ok && res.data) setItems(res.data);
    else toast.error("No se pudieron cargar los comentarios.");
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function moderate(c: PendingComment, accion: "approve" | "reject") {
    setBusyId(c.id);
    const res =
      accion === "approve"
        ? await approveComment(c.petId, c.id)
        : await rejectComment(c.petId, c.id);
    setBusyId(null);
    if (res.ok) {
      toast.success(accion === "approve" ? "Comentario aprobado." : "Comentario rechazado.");
      setItems((prev) => prev.filter((x) => x.id !== c.id));
    } else {
      toast.error(res.error ?? "No se pudo moderar el comentario.");
    }
  }

  return (
    <div className="pub">
      <div className="section-title" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <h2>Comentarios pendientes</h2>
        <p style={{ marginLeft: 0 }}>
          Moderá los comentarios de todas las publicaciones desde un solo lugar.
        </p>
      </div>

      {loading ? (
        <p className="dash-muted">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="comment-empty">
          <MessageCircle size={24} aria-hidden />
          <p>No hay comentarios pendientes. ¡Todo al día!</p>
        </div>
      ) : (
        <ul className="comment-list">
          {items.map((c) => (
            <li key={c.id} className="comment-item comment-item--pending">
              <div className="comment-head">
                <strong>{c.authorName}</strong>
                {c.authorEmail && <span className="comment-email">{c.authorEmail}</span>}
                <span className="comment-time">
                  en{" "}
                  <Link href={`/mascotas-perdidas/${c.petId}`} target="_blank" rel="noopener">
                    {c.petName ?? "una publicación"}
                  </Link>
                </span>
              </div>
              <p className="comment-text">{c.text}</p>
              <div className="comment-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={busyId === c.id}
                  onClick={() => moderate(c, "approve")}
                >
                  <Check size={14} aria-hidden /> Aprobar
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  disabled={busyId === c.id}
                  onClick={() => moderate(c, "reject")}
                >
                  <X size={14} aria-hidden /> Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
