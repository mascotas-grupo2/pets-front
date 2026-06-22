"use client";

import { useMemo } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { Message, userMessage, InboxConversation } from "@/services/messages.services";
import { initials } from "./messages.data";

export function Avatar({ user, small = false }: { user: InboxConversation["user"] | userMessage | null; small?: boolean }) {
  const name = user?.name || "Usuario";
  const className = `msg-avatar${small ? " msg-avatar-sm" : ""}`;
  return user?.photo ? (
    <img src={user.photo} alt={name} className={`${className} object-cover`} />
  ) : (
    <span className={className} aria-hidden>
      {initials(name)}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center p-8">
      <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
    </div>
  );
}

export function Burbuja({
  m,
  isMine,
  user,
  isAdmin,
  onDelete,
}: {
  m: Message;
  isMine: boolean;
  user: userMessage | null;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}) {
  const isClaim = m.content.includes("🔔 RECLAMO DE MASCOTA");

  const claimFields = useMemo(() => {
    if (!isClaim) return null;
    const lines = m.content.split("\n").map((l) => l.trim()).filter(Boolean);
    const fields: Record<string, string> = {};
    let currentSection = "claim";
    // Toma el valor tras el prefijo; descarta vacíos o "undefined" (reclamos viejos).
    const val = (line: string, prefix: string) => {
      const v = line.replace(prefix, "").trim();
      return v && v !== "undefined" ? v : null;
    };
    const set = (key: string, v: string | null) => { if (v) fields[key] = v; };
    for (const line of lines) {
      if (line === "— Datos de quien reclama —") { currentSection = "claimant"; continue; }
      if (line === "— Dueño de la publicación —") { currentSection = "owner"; continue; }
      if (line.startsWith("Mascota:")) set("pet", val(line, "Mascota:"));
      else if (line.startsWith("Link:")) set("link", val(line, "Link:"));
      else if (line.startsWith("Nombre:")) set(currentSection === "claimant" ? "claimantName" : "ownerName", val(line, "Nombre:"));
      else if (line.startsWith("Teléfono:")) set("claimantPhone", val(line, "Teléfono:"));
      else if (line.startsWith("Email:")) set("claimantEmail", val(line, "Email:"));
      else if (line.startsWith("Motivo:")) set("claimantReason", val(line, "Motivo:"));
    }
    return fields;
  }, [m.content, isClaim]);

  return (
    <div className={`msg-bubble-row ${isMine ? "is-mine" : "is-theirs"}`}>
      {!isMine && <Avatar user={user} small />}
      <div className={`msg-bubble${isClaim ? " msg-bubble-claim" : ""}`}>
        {m.photo && (
          <div className="msg-bubble-photo">
            <img src={m.photo} alt="Foto adjunta" />
          </div>
        )}

        {isClaim && claimFields ? (
          <div className="claim-card">
            <div className="claim-header">
              <AlertTriangle size={16} className="claim-icon" />
              <strong>Reclamo de mascota</strong>
            </div>

            {claimFields.pet && (
              <div className="claim-field">
                <span className="claim-label">Mascota:</span>
                <span className="claim-value">
                  {claimFields.pet}
                  {claimFields.link && (
                    <a href={claimFields.link.startsWith("/") ? claimFields.link : `/${claimFields.link}`} className="claim-link">Ver detalle →</a>
                  )}
                </span>
              </div>
            )}

            <div className="claim-divider" />

            <div className="claim-section-title">Quien reclama</div>
            {claimFields.claimantName && <div className="claim-field"><span className="claim-label">Nombre:</span> <span className="claim-value">{claimFields.claimantName}</span></div>}
            {claimFields.claimantPhone && (
              <div className="claim-field">
                <span className="claim-label">Teléfono:</span>
                <span className="claim-value"><a href={`tel:${claimFields.claimantPhone}`} className="claim-link">{claimFields.claimantPhone}</a></span>
              </div>
            )}
            {claimFields.claimantEmail && (
              <div className="claim-field">
                <span className="claim-label">Email:</span>
                <span className="claim-value"><a href={`mailto:${claimFields.claimantEmail}`} className="claim-link">{claimFields.claimantEmail}</a></span>
              </div>
            )}
            {claimFields.claimantReason && <div className="claim-field claim-full"><span className="claim-label">Motivo:</span> <span className="claim-value">{claimFields.claimantReason}</span></div>}

            <div className="claim-divider" />

            <div className="claim-section-title">Dueño de la publicación</div>
            {claimFields.ownerName ? (
              <div className="claim-field"><span className="claim-label">Nombre:</span> <span className="claim-value">{claimFields.ownerName}</span></div>
            ) : (
              <div className="claim-field claim-muted"><em>Publicación sin dueño registrado</em></div>
            )}

            <div className="claim-divider" />

            <div className="claim-hint">Respondé a este mensaje para coordinar el reencuentro.</div>
          </div>
        ) : (
          m.content && (
            <p className="msg-bubble-text">{m.content}</p>
          )
        )}

        <time>
          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
      {(isMine || isAdmin) && (
        <button
          type="button"
          className="msg-delete"
          aria-label="Eliminar mensaje"
          title="Eliminar mensaje"
          onClick={() => onDelete(m.id)}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
