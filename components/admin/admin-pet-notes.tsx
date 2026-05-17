"use client";

import {
  PET_NOTE_KIND_LABEL,
  PET_NOTE_KIND_OPTIONS,
} from "@/lib/admin/pet-status";
import { PetNote, PetNoteKind } from "@/types/pet";
import { useState } from "react";

type Props = {
  notes: PetNote[];
  saving: boolean;
  onAdd: (text: string, kind: PetNoteKind) => Promise<boolean>;
};

export function AdminPetNotes({ notes, saving, onAdd }: Props) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<PetNoteKind>("general");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const ok = await onAdd(value, kind);
    if (ok) {
      setText("");
      setKind("general");
    }
  };

  return (
    <section className="admin-card">
      <h2>Notas de seguimiento</h2>
      <p className="admin-card-hint">
        Registrá novedades del caso: derivación a refugio, atención
        veterinaria, contacto con la familia, etc.
      </p>

      <form className="admin-note-form" onSubmit={submit}>
        <select
          className="select"
          value={kind}
          onChange={(e) => setKind(e.target.value as PetNoteKind)}
          aria-label="Tipo de nota"
        >
          {PET_NOTE_KIND_OPTIONS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Escribí una nota…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={saving || !text.trim()}
        >
          {saving ? "Guardando…" : "Agregar nota"}
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="admin-empty">Todavía no hay notas para esta mascota.</p>
      ) : (
        <ul className="admin-note-list">
          {notes.map((n) => (
            <li key={n.id} className={`admin-note admin-note-${n.kind}`}>
              <div className="admin-note-head">
                <span className="admin-note-kind">
                  {PET_NOTE_KIND_LABEL[n.kind] ?? "General"}
                </span>
                <span>{new Date(n.createdAt).toLocaleString("es-AR")}</span>
              </div>
              <p>{n.text}</p>
              <div className="admin-note-author">
                — {n.authorName ?? "Admin"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
