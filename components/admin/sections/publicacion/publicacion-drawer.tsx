"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { Check, Trash2, X } from "lucide-react";
import type { AdminPetSummary, Pet } from "@/types/pet";
import { EditForm, PublicacionEditForm, toInitial } from "./drawer/PublicacionEditForm";
import { useDrawerActions } from "./drawer/useDrawerActions";
import { Pill } from "../../ui/pill";
import { EditableField } from "./drawer/EditableField";

const yesNo = (v?: boolean | null) =>
  v === true ? "Sí" : v === false ? "No" : null;

type Actions = {
  handleApprove: (id: string) => Promise<boolean>;
  handleReject: (id: string) => Promise<boolean>;
  handleFinalize: (id: string) => Promise<boolean>;
  handleDelete: (id: string) => Promise<boolean>;
  handleSave: (id: string, patch: Partial<Pet>) => Promise<boolean>;
};

type Props = {
  pet: AdminPetSummary;
  onClose: () => void;
  actions: Actions;
  /** Si es true, el drawer abre directamente en modo edición. */
  initialEditing?: boolean;
};

export function PublicacionDrawer({ pet, onClose, actions, initialEditing = false }: Props) {
  const [editing, setEditing] = useState(initialEditing);

  const formik = useFormik<EditForm>({
    initialValues: toInitial(pet),
    onSubmit: async (values) => {
      const ok = await drawerActions.save(values);
      if (ok) setEditing(false);
    },
  });

  const drawerActions = useDrawerActions(pet, actions, onClose);
  const photo = pet.photos?.[0] ?? pet.photo ?? null;

  function handleCancelEdit() {
    formik.resetForm();
    onClose();
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
          <h2>{editing ? `Editar: ${pet.name ?? "publicación"}` : (pet.name ?? "Sin nombre")}</h2>
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
            <img className="vdrawer-photo" src={photo} alt={pet.name ?? ""} />
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
                <EditableField label="Nombre" value={pet.ownerName ?? "Anónimo"} editing={false}>{null}</EditableField>
                <EditableField label="Email" value={pet.ownerEmail ?? pet.contactEmail} editing={false}>{null}</EditableField>
              </section>

              {/* Datos del animal */}
              <section className="vdrawer-section">
                <h3>Datos del animal</h3>
                <EditableField label="Nombre" value={pet.name} editing={false}>{null}</EditableField>
                <EditableField label="Estado" value={pet.statusLabel ?? pet.status} editing={false}>{null}</EditableField>
                <EditableField label="Especie" value={pet.animalTypeLabel ?? pet.animalType} editing={false}>{null}</EditableField>
                <EditableField label="Sexo" value={pet.sexLabel ?? pet.sex} editing={false}>{null}</EditableField>
                <EditableField label="Raza" value={pet.breed} editing={false}>{null}</EditableField>
                <EditableField label="Edad (meses)" value={pet.ageMonths} editing={false}>{null}</EditableField>
                <EditableField label="Color" value={pet.color} editing={false}>{null}</EditableField>
                <EditableField label="Peso (kg)" value={pet.weightKg} editing={false}>{null}</EditableField>
                <EditableField label="Altura (cm)" value={pet.heightCm} editing={false}>{null}</EditableField>
                <EditableField label="Estado de salud" value={pet.medicalStatusLabel ?? pet.medicalStatus} editing={false}>{null}</EditableField>
              </section>

              {/* Características */}
              <section className="vdrawer-section">
                <h3>Características</h3>
                <EditableField label="Collar" value={yesNo(pet.hasCollar)} editing={false}>{null}</EditableField>
                <EditableField label="Chapa" value={yesNo(pet.hasTag)} editing={false}>{null}</EditableField>
                <EditableField label="Microchip" value={yesNo(pet.microchipped)} editing={false}>{null}</EditableField>
                <EditableField label="Castrado" value={yesNo(pet.neutered)} editing={false}>{null}</EditableField>
                <EditableField label="Vacunado" value={yesNo(pet.vaccinated)} editing={false}>{null}</EditableField>
                <EditableField label="Bueno con niños" value={yesNo(pet.friendlyWithKids)} editing={false}>{null}</EditableField>
                <EditableField label="Entrenado" value={yesNo(pet.trained)} editing={false}>{null}</EditableField>
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
                <EditableField label="Ubicación" value={pet.location} editing={false}>{null}</EditableField>
                <EditableField label="Fecha" value={pet.date} editing={false}>{null}</EditableField>
                <EditableField label="Email" value={pet.contactEmail} editing={false}>{null}</EditableField>
                <EditableField label="Teléfono" value={pet.contactPhone} editing={false}>{null}</EditableField>
              </section>
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
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
                onClick={drawerActions.remove}
                disabled={drawerActions.busy}
              >
                <Trash2 size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={drawerActions.reject}
                disabled={drawerActions.busy}
              >
                <X size={16} aria-hidden /> Rechazar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={drawerActions.approve}
                disabled={drawerActions.busy}
              >
                <Check size={16} aria-hidden />
                {drawerActions.busy ? "Procesando…" : "Aprobar"}
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}
