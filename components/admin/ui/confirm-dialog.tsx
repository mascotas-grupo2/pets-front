"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = {
  /** Controla la visibilidad. Si es false no se renderiza nada. */
  open: boolean;
  /** Título del modal (lo único que suele cambiar entre acciones). */
  title: string;
  /** Pregunta o detalle que se muestra arriba del campo de motivo. */
  message?: string;
  /** Si es true, exige escribir un motivo antes de poder confirmar. */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** Texto del botón de confirmación. Por defecto "Sí". */
  confirmLabel?: string;
  /** Texto del botón de cancelar. Por defecto "No". */
  cancelLabel?: string;
  /** Pinta el botón de confirmación como peligroso (rojo). */
  danger?: boolean;
  /** Deshabilita los controles mientras se procesa la acción. */
  busy?: boolean;
  /** Recibe el motivo (string vacío si no se pidió). */
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/**
 * Modal de confirmación genérico (Sí / No) reutilizable para eliminar,
 * rechazar y aceptar publicaciones. Solo cambia el título y, opcionalmente,
 * pide un motivo obligatorio.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  requireReason = false,
  reasonLabel = "Motivo",
  reasonPlaceholder = "Escribí el motivo…",
  confirmLabel = "Sí",
  cancelLabel = "No",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = useState("");

  // Limpiamos el motivo cada vez que el modal se cierra.
  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  const reasonMissing = requireReason && reason.trim().length === 0;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={busy ? undefined : onCancel}
      role="presentation"
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="vdrawer-close"
            aria-label="Cerrar"
            onClick={onCancel}
            disabled={busy}
          >
            <X size={18} />
          </button>
        </div>

        <div className="confirm-dialog-body">
          {message && <p className="confirm-dialog-message">{message}</p>}

          {requireReason && (
            <div className="confirm-dialog-field">
              <label className="field-label">{reasonLabel} *</label>
              <textarea
                className="input confirm-dialog-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                rows={4}
                disabled={busy}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="confirm-dialog-foot">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || reasonMissing}
          >
            {busy ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
