"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { Check, Trash2, X, RotateCw, Home } from "lucide-react";
import type { AdminPetSummary, Pet } from "@/types/pet";
import {
  EditForm,
  PublicacionEditForm,
  toInitial,
} from "./drawer/PublicacionEditForm";
import { useDrawerActions } from "./drawer/useDrawerActions";
import { Pill } from "../../ui/pill";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { EditableField } from "./drawer/EditableField";
import { SightingsSection } from "./drawer/SightingsSection";

const yesNo = (v?: boolean | null) =>
  v === true ? "Sí" : v === false ? "No" : null;

type Actions = {
  handleApprove: (id: string) => Promise<boolean>;
  handleReject: (id: string, reason?: string) => Promise<boolean>;
  handleFinalize: (id: string) => Promise<boolean>;
  handleDelete: (id: string, reason?: string) => Promise<boolean>;
  handleConfirmReturn: (id: string, returnedTo: string) => Promise<boolean>;
  handleApproveClaim: (id: string, adminNote?: string) => Promise<boolean>;
  handleRenew: (id: string) => Promise<boolean>;
  handleSave: (id: string, patch: Partial<Pet>) => Promise<boolean>;
};

/** Acción pendiente de confirmación en el modal. */
type PendingAction =
  | "delete"
  | "reject"
  | "approve"
  | "confirmReturn"
  | "renew";

type Props = {
  pet: AdminPetSummary;
  onClose: () => void;
  actions: Actions;
  /** Si es true, el drawer abre directamente en modo edición. */
  initialEditing?: boolean;
};

/** Config del modal de confirmación según la acción pendiente. */
const CONFIRM_CONFIG: Record<
  PendingAction,
  {
    title: string;
    message: (name: string) => string;
    requireReason: boolean;
    reasonLabel?: string;
    danger?: boolean;
  }
> = {
  delete: {
    title: "Eliminar publicación",
    message: (name) =>
      `¿Seguro que querés eliminar la publicación "${name}"? Esta acción no se puede deshacer.`,
    requireReason: true,
    reasonLabel: "Motivo de la eliminación",
    danger: true,
  },
  reject: {
    title: "Rechazar publicación",
    message: (name) => `¿Seguro que querés rechazar la publicación "${name}"?`,
    requireReason: true,
    reasonLabel: "Motivo del rechazo",
  },
  approve: {
    title: "Aceptar publicación",
    message: () => "¿Seguro de que querés aceptar la publicación y aceptarlo?",
    requireReason: false,
  },
  confirmReturn: {
    title: "Confirmar devolución",
    message: (name) =>
      `¿Confirmás que "${name}" fue devuelta a su dueño? Se cerrará la publicación y se cancelarán adopciones activas.`,
    requireReason: false,
    reasonLabel: "Nota (opcional)",
  },
  renew: {
    title: "Renovar publicación",
    message: (name) =>
      `¿Renovar la publicación "${name}"? Se extenderá su vencimiento y, si estaba oculta por vencida, volverá a ser visible.`,
    requireReason: false,
  },
};

export function PublicacionDrawer({
  pet,
  onClose,
  actions,
  initialEditing = false,
}: Props) {
  const [editing, setEditing] = useState(initialEditing);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const formik = useFormik<EditForm>({
    initialValues: toInitial(pet),
    onSubmit: async (values) => {
      const ok = await drawerActions.save(values);
      if (ok) setEditing(false);
    },
  });

  const drawerActions = useDrawerActions(pet, actions, onClose);
  const photo = pet.photos?.[0] ?? pet.photo ?? null;

  // Aprobar/Rechazar son acciones de MODERACIÓN: solo aplican mientras la
  // publicación está "pendiente". Una vez aprobada (activo), rechazada,
  // finalizada o reservada, los botones se deshabilitan; el dueño debe editarla
  // (vuelve a pendiente) o el admin la elimina.
  const canModerate = pet.reportStatus === "pendiente";
  const moderationHint = (() => {
    switch (pet.reportStatus) {
      case "rechazado":
        return "Esta publicación está rechazada. El dueño debe editarla para que vuelva a revisión, o podés eliminarla.";
      case "activo":
        return "Esta publicación ya está aprobada y publicada. No se puede volver a aprobar ni rechazar; el dueño debe editarla (vuelve a revisión) o podés eliminarla.";
      case "finalizado":
        return "Esta publicación está finalizada y no admite cambios de moderación.";
      case "reservada":
        return "Esta publicación está reservada por una solicitud de adopción en curso.";
      default:
        return null;
    }
  })();

  function handleCancelEdit() {
    formik.resetForm();
    onClose();
  }

  // Ejecuta la acción confirmada. Si falla, el drawer y el modal quedan
  // abiertos para reintentar; si tiene éxito, run() cierra el drawer entero.
  async function handleConfirm(reason: string) {
    if (pending === "delete") await drawerActions.remove(reason);
    else if (pending === "reject") await drawerActions.reject(reason);
    else if (pending === "approve") await drawerActions.approve();
    else if (pending === "confirmReturn")
      await drawerActions.confirmReturn(reason);
    else if (pending === "renew") await drawerActions.renew();
    setPending(null);
  }

  return (
    <div className="vdrawer-overlay" onClick={onClose}>
      <aside
        className="vdrawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${editing ? "Editar" : "Detalle de"} ${pet.name ?? "publicación"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="vdrawer-head">
          <h2>
            {editing
              ? `Editar: ${pet.name ?? "publicación"}`
              : (pet.name ?? "Sin nombre")}
          </h2>
          <div className="vdrawer-head-actions">
            <button
              type="button"
              className="vdrawer-close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="vdrawer-body">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="vdrawer-photo"
              src={photo}
              alt={pet.name ? `Foto de ${pet.name}` : "Foto de la mascota"}
            />
          )}

          {editing ? (
            <PublicacionEditForm formik={formik} />
          ) : (
            <>
              {/* Pills */}
              <div className="vdrawer-pills">
                {pet.status && (
                  <Pill tone="violet">{pet.statusLabel ?? pet.status}</Pill>
                )}
                <Pill tone="amber">{pet.reportStatusLabel ?? "Pendiente"}</Pill>
              </div>

              {/* Creado por */}
              <section className="vdrawer-section">
                <h3>Creado por</h3>
                <EditableField
                  label="Nombre"
                  value={pet.ownerName ?? "Anónimo"}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Email"
                  value={pet.ownerEmail ?? pet.contactEmail}
                  editing={false}
                >
                  {null}
                </EditableField>
              </section>

              {/* Datos del animal */}
              <section className="vdrawer-section">
                <h3>Datos del animal</h3>
                <EditableField label="Nombre" value={pet.name} editing={false}>
                  {null}
                </EditableField>
                <EditableField
                  label="Estado"
                  value={pet.statusLabel ?? pet.status}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Especie"
                  value={pet.animalTypeLabel ?? pet.animalType}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Sexo"
                  value={pet.sexLabel ?? pet.sex}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField label="Raza" value={pet.breed} editing={false}>
                  {null}
                </EditableField>
                <EditableField
                  label="Edad (meses)"
                  value={pet.ageMonths}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField label="Color" value={pet.color} editing={false}>
                  {null}
                </EditableField>
                <EditableField
                  label="Peso (kg)"
                  value={pet.weightKg}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Altura (cm)"
                  value={pet.heightCm}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Estado de salud"
                  value={pet.medicalStatusLabel ?? pet.medicalStatus}
                  editing={false}
                >
                  {null}
                </EditableField>
              </section>

              {/* Características */}
              <section className="vdrawer-section">
                <h3>Características</h3>
                <EditableField
                  label="Collar"
                  value={yesNo(pet.hasCollar)}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Chapa"
                  value={yesNo(pet.hasTag)}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Microchip"
                  value={yesNo(pet.microchipped)}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Castrado"
                  value={yesNo(pet.neutered)}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Vacunado"
                  value={yesNo(pet.vaccinated)}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Bueno con niños"
                  value={yesNo(pet.friendlyWithKids)}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Entrenado"
                  value={yesNo(pet.trained)}
                  editing={false}
                >
                  {null}
                </EditableField>
              </section>

              {/* Descripción */}
              {pet.description && (
                <section className="vdrawer-section">
                  <h3>Descripción</h3>
                  <p className="vdrawer-desc">{pet.description}</p>
                </section>
              )}

              {/* Ubicación y contacto */}
              <section className="vdrawer-section">
                <h3>Ubicación y contacto</h3>
                <EditableField
                  label="Ubicación"
                  value={pet.location}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField label="Fecha" value={pet.date} editing={false}>
                  {null}
                </EditableField>
                <EditableField
                  label="Email"
                  value={pet.contactEmail}
                  editing={false}
                >
                  {null}
                </EditableField>
                <EditableField
                  label="Teléfono"
                  value={pet.contactPhone}
                  editing={false}
                >
                  {null}
                </EditableField>
              </section>

              <SightingsSection petId={pet.id} />
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {!editing && !canModerate && moderationHint && (
          <p className="vdrawer-foot-hint">{moderationHint}</p>
        )}
        <footer className="vdrawer-foot">
          {editing ? (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancelEdit}
                disabled={drawerActions.busy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => formik.submitForm()}
                disabled={drawerActions.busy || !formik.dirty}
              >
                <Check size={16} aria-hidden />
                {drawerActions.busy ? "Guardando…" : "Guardar"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setPending("delete")}
                disabled={drawerActions.busy}
              >
                <Trash2 size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPending("reject")}
                disabled={drawerActions.busy || !canModerate}
                title={!canModerate ? (moderationHint ?? undefined) : undefined}
              >
                <X size={16} aria-hidden /> Rechazar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPending("approve")}
                disabled={drawerActions.busy || !canModerate}
                title={!canModerate ? (moderationHint ?? undefined) : undefined}
              >
                <Check size={16} aria-hidden />
                {drawerActions.busy ? "Procesando…" : "Aprobar"}
              </button>
              {/* Botón "Confirmar devolución": solo si la mascota está en refugio/tránsito (NO si está perdida) */}
              {(pet.status === "encontrado" ||
                pet.status === "en tránsito" ||
                pet.status === "en tratamiento médico") &&
                pet.reportStatus === "activo" && (
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => setPending("confirmReturn")}
                    disabled={drawerActions.busy}
                    title="Marcar como devuelta al dueño"
                  >
                    <Home size={16} aria-hidden /> Devuelta al dueño
                  </button>
                )}
              {/* Botón "Renovar": si la publicación tiene vencimiento y no está finalizada
                  (las finalizadas no se renuevan; el guard cubre data vieja con expiresAt). */}
              {pet.expiresAt != null && pet.reportStatus !== "finalizado" && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPending("renew")}
                  disabled={drawerActions.busy}
                  title={
                    pet.expired
                      ? "Publicación vencida — renovar para volver a publicarla"
                      : `Vence en ${pet.daysLeft} día${pet.daysLeft === 1 ? "" : "s"} — renovar`
                  }
                >
                  <RotateCw size={16} aria-hidden />{" "}
                  {pet.expired ? "Renovar (vencida)" : "Renovar"}
                </button>
              )}
            </>
          )}
        </footer>
      </aside>

      {pending && (
        <ConfirmDialog
          open
          title={CONFIRM_CONFIG[pending].title}
          message={CONFIRM_CONFIG[pending].message(pet.name ?? "sin nombre")}
          requireReason={CONFIRM_CONFIG[pending].requireReason}
          reasonLabel={CONFIRM_CONFIG[pending].reasonLabel}
          danger={CONFIRM_CONFIG[pending].danger}
          busy={drawerActions.busy}
          confirmLabel="Sí"
          cancelLabel="No"
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
