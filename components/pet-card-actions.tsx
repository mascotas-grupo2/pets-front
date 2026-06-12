"use client";

import { Pet } from "@/types/pet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Share2, Eye, Check, X } from "lucide-react";

function petLabel(pet: Pet): string {
  return pet.name ?? pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1);
}

/** Acciones de la tarjeta: Compartir (difundir), "La vi" (avistamiento) y Ver más. */
export function PetCardActions({ pet }: { pet: Pet }) {
  const [copied, setCopied] = useState(false);
  const [sightOpen, setSightOpen] = useState(false);

  const href = `/mascotas-perdidas/${pet.id}`;
  const name = petLabel(pet);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
    const text = `${name} — ${pet.status} en ${pet.location}. Ayudá a difundir 🐾`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: name, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* el usuario canceló el diálogo de compartir: nada que hacer */
    }
  };

  return (
    <>
      <div className="pet-card-actions">
        <button
          type="button"
          className="pet-action pet-action--share"
          onClick={handleShare}
          aria-label={`Compartir ${name}`}
        >
          {copied ? <Check size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
          {copied ? "¡Copiado!" : "Compartir"}
        </button>
        <button
          type="button"
          className="pet-action pet-action--sight"
          onClick={() => setSightOpen(true)}
          aria-label={`Reportar que viste a ${name}`}
        >
          <Eye size={15} aria-hidden /> La vi
        </button>
        <Link href={href} className="pet-action pet-action--more">
          Ver más →
        </Link>
      </div>

      {sightOpen && (
        <SightingModal pet={pet} name={name} onClose={() => setSightOpen(false)} />
      )}
    </>
  );
}

/** Modal "La vi": el transeúnte deja dónde/cuándo y se compone un aviso al dueño. */
function SightingModal({
  pet,
  name,
  onClose,
}: {
  pet: Pet;
  name: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [place, setPlace] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [when, setWhen] = useState(today);
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/mascotas-perdidas/${pet.id}`;
    const subject = `👀 Vi a ${name} (${pet.status})`;
    const body =
      `¡Hola! Creo que vi a ${name}.\n\n` +
      `📍 Dónde: ${place || "—"}\n` +
      `📅 Cuándo: ${when}\n` +
      `📝 Detalle: ${note || "—"}\n` +
      `📞 Mi contacto: ${contact || "—"}\n\n` +
      `Publicación: ${url}`;
    window.location.href = `mailto:${pet.contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="sight-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sight-modal" role="dialog" aria-modal="true" aria-labelledby="sight-title">
        <div className="sight-head">
          <div>
            <span className="sight-eyebrow">
              <Eye size={14} aria-hidden /> Reportar avistamiento
            </span>
            <h2 id="sight-title">¿Viste a {name}?</h2>
          </div>
          <button type="button" className="sight-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} aria-hidden />
          </button>
        </div>
        <p className="sight-intro">
          Tu pista puede reunir a {name} con su familia. Contanos lo que viste y
          le avisamos a quien lo busca.
        </p>
        <form className="sight-form" onSubmit={submit}>
          <label className="sight-field">
            <span>¿Dónde la/lo viste?</span>
            <input
              className="input"
              type="text"
              placeholder="Esquina, plaza, comercio…"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              autoFocus
            />
          </label>
          <label className="sight-field">
            <span>¿Cuándo?</span>
            <input
              className="input"
              type="date"
              max={today}
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </label>
          <label className="sight-field">
            <span>Detalle (opcional)</span>
            <textarea
              className="input"
              rows={3}
              placeholder="Iba hacia…, estaba con…, cómo se la veía…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <label className="sight-field">
            <span>Tu contacto (opcional)</span>
            <input
              className="input"
              type="text"
              placeholder="Teléfono o email para coordinar"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </label>
          <div className="sight-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Enviar aviso
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
