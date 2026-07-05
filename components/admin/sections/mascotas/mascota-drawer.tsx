"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { X, PawPrint, Heart, Home, Pencil, Save } from "lucide-react";
import {
  MascotaEstadoPill,
  transicionesMascotaPermitidas,
  esEstadoMascotaTerminal,
} from "../../lib/pet-status";
import { formatEdad } from "../../lib/pet-format";
import {
  updatePet,
  entregaDirectaPet,
  resolvePet,
  confirmReturnPet,
  getIdPets,
} from "@/services/mascotas.pets";
import { useMascotaDetalle } from "../hook/useMascotaDetalle";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { ComboSelect } from "../../ui/combo-select";
import type { AdminPetSummary, PetSex, PetStatus } from "@/types/pet";

type Props = {
  pet: AdminPetSummary;
  onClose: () => void;
  /** Se llama tras cambiar el estado o registrar una entrega, para recargar la lista. */
  onChanged?: () => void;
  /** Modo revisión (ej. al abrir desde una alerta de reclamo): oculta "Gestionar
   *  estado" — acá se viene a MIRAR el caso, no a operar la mascota. */
  reviewMode?: boolean;
  /** Abrir directamente en modo edición de la ficha (vacunas, peso, etc.). */
  initialEditing?: boolean;
};

/** Campos editables de la ficha desde el panel del refugio. */
type EditForm = {
  name: string;
  breed: string;
  color: string;
  sex: PetSex | "";
  weightKg: string;
  heightCm: string;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
  hasCollar: boolean;
  hasTag: boolean;
  friendlyWithKids: boolean;
  trained: boolean;
};

function petToEditForm(p: {
  name?: string;
  breed?: string;
  color?: string;
  sex?: PetSex;
  weightKg?: number;
  heightCm?: number;
  description?: string;
  vaccinated?: boolean;
  neutered?: boolean;
  microchipped?: boolean;
  hasCollar?: boolean;
  hasTag?: boolean;
  friendlyWithKids?: boolean;
  trained?: boolean;
}): EditForm {
  return {
    name: p.name ?? "",
    breed: p.breed ?? "",
    color: p.color ?? "",
    sex: p.sex ?? "",
    weightKg: p.weightKg != null ? String(p.weightKg) : "",
    heightCm: p.heightCm != null ? String(p.heightCm) : "",
    description: p.description ?? "",
    vaccinated: !!p.vaccinated,
    neutered: !!p.neutered,
    microchipped: !!p.microchipped,
    hasCollar: !!p.hasCollar,
    hasTag: !!p.hasTag,
    friendlyWithKids: !!p.friendlyWithKids,
    trained: !!p.trained,
  };
}

/** Checkboxes de la ficha (estado sanitario / comportamiento). */
const EDIT_CHECKS: { key: keyof EditForm; label: string }[] = [
  { key: "vaccinated", label: "Vacunado/a" },
  { key: "neutered", label: "Castrado/a" },
  { key: "microchipped", label: "Tiene microchip" },
  { key: "hasCollar", label: "Tiene collar" },
  { key: "hasTag", label: "Tiene chapita" },
  { key: "friendlyWithKids", label: "Se lleva bien con chicos" },
  { key: "trained", label: "Entrenado/a" },
];

/** Estados operativos que el admin puede setear a mano (sin "adoptado"). */
const STATUS_LABEL: Record<PetStatus, string> = {
  perdido: "Perdido",
  "en tránsito": "En tránsito",
  "en tratamiento médico": "En tratamiento médico",
  "en adopción": "En adopción",
  adoptado: "Adoptado",
  "devuelta al dueño": "Devuelta al dueño",
};

type Tab =
  | "overview"
  | "historial"
  | "seguimientos"
  | "solicitudes"
  | "archivos"
  | "notas";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
];

const NOTE_KIND_LABEL: Record<string, string> = {
  general: "General",
  medica: "Médica",
  adopcion: "Adopción",
};

function fmtFecha(d: string) {
  return new Date(d).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function boolText(v?: boolean) {
  if (v === undefined) return "—";
  return v ? "Sí" : "No";
}

const IMG_URL_RE = /(https?:\/\/\S+?\.(?:png|jpe?g|jfif|webp))/gi;

/** Separa de una nota las URLs de imagen (ej. fotos de prueba de un reclamo) del
 *  texto, y limpia datos internos que no van en la UI (ID de usuario). */
function splitNotePhotos(text: string) {
  const fotos = text.match(IMG_URL_RE) ?? [];
  const limpio = text
    .replace(IMG_URL_RE, "")
    .replace(/Fotos de prueba:\s*/i, "")
    .replace(/Usuario ID:\s*\d+/i, "") // dato interno, no se muestra
    .replace(/\s{2,}/g, " ")
    .trim();
  return { limpio, fotos };
}

/** Drawer lateral con el detalle de una mascota. */
export function MascotaDrawer({
  pet,
  onClose,
  onChanged,
  reviewMode = false,
  initialEditing = false,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const {
    loading: loadingDetalle,
    notas,
    proximo,
    compat,
  } = useMascotaDetalle(pet.id);
  const [estado, setEstado] = useState<PetStatus>(pet.status);
  const [recipient, setRecipient] = useState("");
  const [showEntrega, setShowEntrega] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showDevolver, setShowDevolver] = useState(false);
  const [busy, setBusy] = useState(false);

  // --- Edición inline de la ficha ---
  const [editing, setEditing] = useState(initialEditing);
  const [editForm, setEditForm] = useState<EditForm>(() => petToEditForm(pet));
  const [savingEdit, setSavingEdit] = useState(false);

  // Al entrar en edición traemos la ficha completa (la fila de la tabla puede no
  // traer todos los campos, p. ej. vacunado/microchip), para no pisarlos con false.
  useEffect(() => {
    if (!editing) return;
    let ignore = false;
    getIdPets(pet.id).then((res) => {
      if (!ignore && res?.ok && res.data) setEditForm(petToEditForm(res.data));
    });
    return () => {
      ignore = true;
    };
  }, [editing, pet.id]);

  function setField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setEditForm((f) => ({ ...f, [key]: value }));
  }

  async function guardarFicha() {
    setSavingEdit(true);
    const patch: Record<string, unknown> = {
      name: editForm.name.trim() || undefined,
      breed: editForm.breed.trim() || null,
      color: editForm.color.trim() || null,
      sex: editForm.sex || undefined,
      description: editForm.description,
      weightKg: editForm.weightKg === "" ? null : Number(editForm.weightKg),
      heightCm: editForm.heightCm === "" ? null : Number(editForm.heightCm),
      vaccinated: editForm.vaccinated,
      neutered: editForm.neutered,
      microchipped: editForm.microchipped,
      hasCollar: editForm.hasCollar,
      hasTag: editForm.hasTag,
      friendlyWithKids: editForm.friendlyWithKids,
      trained: editForm.trained,
    };
    const res = await updatePet(pet.id, patch);
    setSavingEdit(false);
    if (res.ok) {
      toast.success("Ficha actualizada.");
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudieron guardar los cambios.");
    }
  }
  const yaAdoptada = esEstadoMascotaTerminal(pet.status);
  // "Registrar adopción directa" solo aplica a mascotas que están en adopción.
  const puedeEntregar = pet.status === "en adopción";
  // Mascota marcada "con dueño" (isOwner, sea por el form o por un reclamo
  // aprobado): el paso correcto es devolverla, no ponerla en el flujo del refugio.
  const tieneDuenoVerificado =
    pet.isOwner === true && pet.status !== "devuelta al dueño";
  const puedeDevolver =
    tieneDuenoVerificado && !yaAdoptada && pet.reportStatus !== "finalizado";
  // El cierre "apareció/resuelta" aplica a perdidas SIN dueño verificado (con
  // dueño verificado se usa "Devolver al dueño").
  const puedeCerrar =
    !tieneDuenoVerificado &&
    pet.status === "perdido" &&
    pet.reportStatus !== "finalizado";
  // El refugio puede editar la ficha (vacunas, peso, tratamiento…) una vez que la
  // mascota está en su custodia (en tránsito o estado posterior).
  const puedeEditarFicha = new Set<PetStatus>([
    "en tránsito",
    "en tratamiento médico",
    "en adopción",
    "adoptado",
    "devuelta al dueño",
  ]).has(pet.status);
  // Estados ofrecidos: el actual + solo los siguientes válidos (incremental).
  const opcionesEstado: PetStatus[] = [
    pet.status,
    ...transicionesMascotaPermitidas(pet.status),
  ];
  const thumb = pet.photos?.[0] ?? pet.photo ?? null;

  async function guardarEstado() {
    if (estado === pet.status) return;
    setBusy(true);
    const res = await updatePet(pet.id, { status: estado });
    setBusy(false);
    if (res.ok) {
      toast.success("Estado actualizado.");
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudo cambiar el estado.");
    }
  }

  async function registrarEntrega() {
    if (!recipient.trim()) return;
    setBusy(true);
    const res = await entregaDirectaPet(pet.id, recipient.trim());
    setBusy(false);
    if (res.ok) {
      toast.success("Adopción directa registrada.");
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudo registrar la entrega.");
    }
  }

  async function cerrarPublicacion() {
    setBusy(true);
    const res = await resolvePet(pet.id);
    setBusy(false);
    if (res.ok) {
      toast.success("Publicación cerrada.");
      setShowCerrar(false);
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudo cerrar la publicación.");
    }
  }

  async function devolverAlDueno() {
    setBusy(true);
    const res = await confirmReturnPet(pet.id, pet.ownerName ?? "su dueño");
    setBusy(false);
    if (res.ok) {
      toast.success("Mascota devuelta a su dueño.");
      setShowDevolver(false);
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudo registrar la devolución.");
    }
  }
  const especie = pet.animalTypeLabel ?? pet.animalType ?? "—";
  const sub = [especie, pet.breed, formatEdad(pet.ageMonths)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="vdrawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="vdrawer"
        role="dialog"
        aria-label={`Detalle de ${pet.name ?? "mascota"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vdrawer-head">
          <h2>
            {editing
              ? `Editar ficha · ${pet.name ?? "mascota"}`
              : (pet.name ?? "Sin nombre")}
          </h2>
          <button
            type="button"
            className="vdrawer-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="vdrawer-body">
          {editing ? (
            <MascotaFichaForm form={editForm} setField={setField} />
          ) : (
          <>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="vdrawer-photo" src={thumb} alt={pet.name ?? ""} />
          ) : (
            <div className="vdrawer-photo mdrawer-photo-empty">
              <PawPrint size={40} aria-hidden />
            </div>
          )}

          <div className="vdrawer-pills">
            <MascotaEstadoPill status={pet.status} label={pet.statusLabel} />
          </div>
          <p className="mdrawer-sub">{sub}</p>
          <p className="mdrawer-ingreso">Ingresó: {pet.date ?? "—"}</p>

          <>
            <>
              <div className="vdrawer-section">
                <h3>Información</h3>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Sexo</span>
                  <span className="vdrawer-field-value">
                    {pet.sexLabel ?? pet.sex ?? "—"}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Refugio</span>
                  <span className="vdrawer-field-value">
                    {pet.refugioName ?? "—"}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Esterilizado</span>
                  <span className="vdrawer-field-value">
                    {boolText(pet.neutered)}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Peso</span>
                  <span className="vdrawer-field-value">
                    {pet.weightKg ? `${pet.weightKg} kg` : "—"}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Color</span>
                  <span className="vdrawer-field-value">
                    {pet.color ?? "—"}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Personalidad</span>
                  <span className="vdrawer-field-value">
                    {pet.description || "—"}
                  </span>
                </div>
              </div>

              <div className="vdrawer-section">
                <h3>Estado actual</h3>
                <div className="vdrawer-pills">
                  <MascotaEstadoPill
                    status={pet.status}
                    label={pet.statusLabel}
                  />
                </div>
                {pet.description ? (
                  <p className="vdrawer-desc">{pet.description}</p>
                ) : (
                  <p className="vdrawer-desc mdrawer-muted">Sin descripción.</p>
                )}
              </div>

              {!reviewMode && (
                <div className="vdrawer-section">
                  <h3>Gestionar estado</h3>
                  {yaAdoptada ? (
                    <p className="vdrawer-desc mdrawer-muted">
                      La mascota está adoptada (estado final).
                    </p>
                  ) : puedeDevolver ? (
                    <>
                      <p className="vdrawer-desc mdrawer-muted">
                        Esta mascota tiene dueño verificado
                        {pet.ownerName ? ` (${pet.ownerName})` : ""}. Cuando lo
                        retire, cerrá la publicación devolviéndola a su dueño.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowDevolver(true)}
                        disabled={busy}
                      >
                        <Home size={16} aria-hidden /> Devolver al dueño
                      </button>
                    </>
                  ) : (
                    <div className="mdrawer-estado-row">
                      <ComboSelect
                        value={estado}
                        options={opcionesEstado.map((s) => ({
                          value: s,
                          label: `${STATUS_LABEL[s]}${s === pet.status ? " (actual)" : ""}`,
                        }))}
                        placeholder="Estado"
                        searchable={false}
                        grow
                        disabled={busy}
                        onChange={(v) => setEstado(v as PetStatus)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={guardarEstado}
                        disabled={busy || estado === pet.status}
                      >
                        Guardar
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="vdrawer-section">
                <h3>Compatibilidad promedio</h3>
                {loadingDetalle ? (
                  <p className="vdrawer-desc mdrawer-muted">Cargando…</p>
                ) : compat.promedio == null ? (
                  <p className="vdrawer-desc mdrawer-muted">
                    Sin solicitudes de adopción todavía.
                  </p>
                ) : (
                  <>
                    <div className="mdrawer-compat">
                      <div className="mdrawer-compat-bar">
                        <div
                          className="mdrawer-compat-fill"
                          style={{ width: `${compat.promedio}%` }}
                        />
                      </div>
                      <span className="mdrawer-compat-val">
                        {compat.promedio}%
                      </span>
                    </div>
                    <p className="mdrawer-seg-meta">
                      Promedio de {compat.solicitudes} solicitud
                      {compat.solicitudes === 1 ? "" : "es"}.
                    </p>
                  </>
                )}
              </div>

              <div className="vdrawer-section">
                <h3>Próximo seguimiento</h3>
                {loadingDetalle ? (
                  <p className="vdrawer-desc mdrawer-muted">Cargando…</p>
                ) : !proximo ? (
                  <p className="vdrawer-desc mdrawer-muted">
                    Sin seguimientos programados.
                  </p>
                ) : (
                  <>
                    <p className="mdrawer-seg-tipo">
                      {proximo.type?.label ?? "Seguimiento"}
                    </p>
                    <p className="mdrawer-seg-meta">
                      {fmtFecha(proximo.appointmentAt)}
                    </p>
                    {proximo.status?.label && (
                      <p className="mdrawer-seg-meta">{proximo.status.label}</p>
                    )}
                  </>
                )}
              </div>

              <div className="vdrawer-section">
                <h3>Notas</h3>
                {loadingDetalle ? (
                  <p className="vdrawer-desc mdrawer-muted">Cargando…</p>
                ) : notas.length === 0 ? (
                  <p className="vdrawer-desc mdrawer-muted">Sin notas.</p>
                ) : (
                  notas.map((n) => {
                    const { limpio, fotos } = splitNotePhotos(n.text);
                    return (
                      <div key={n.id} className="mdrawer-nota">
                        <p className="vdrawer-desc">{limpio}</p>
                        {fotos.length > 0 && (
                          <div className="mdrawer-nota-fotos">
                            {fotos.map((src, i) => (
                              <a
                                key={i}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                title="Ver foto de prueba"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={`Prueba ${i + 1}`}
                                  onError={(e) => {
                                    // Si la foto no existe/falla, ocultamos el enlace
                                    // (evita el ícono de imagen rota).
                                    const a = e.currentTarget.closest("a");
                                    if (a) a.style.display = "none";
                                  }}
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        <span className="mdrawer-seg-meta">
                          {NOTE_KIND_LABEL[n.kind]
                            ? `${NOTE_KIND_LABEL[n.kind]} · `
                            : ""}
                          {fmtFecha(n.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          </>
          </>
          )}
        </div>

        <div
          className="vdrawer-foot"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: "0.5rem",
          }}
        >
          {editing ? (
            <>
              <button
                type="button"
                className="btn btn-primary mdrawer-save-btn"
                onClick={guardarFicha}
                disabled={savingEdit}
              >
                <Save size={16} aria-hidden />
                {savingEdit ? "Guardando…" : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditing(false)}
                disabled={savingEdit}
              >
                Cancelar
              </button>
            </>
          ) : (
          <>
          {puedeEntregar &&
            (showEntrega ? (
              <div className="mdrawer-estado-row">
                <input
                  className="input"
                  placeholder="¿A quién se entregó?"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={busy}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={registrarEntrega}
                  disabled={busy || !recipient.trim()}
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEntrega(false)}
                  disabled={busy}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowEntrega(true)}
              >
                <Heart size={16} aria-hidden /> Registrar adopción directa
              </button>
            ))}
          {puedeCerrar && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowCerrar(true)}
              disabled={busy}
            >
              Cerrar publicación (apareció / resuelta)
            </button>
          )}
          {puedeEditarFicha && !reviewMode && (
            <button
              type="button"
              className="btn btn-outline mdrawer-save-btn"
              onClick={() => setEditing(true)}
            >
              <Pencil size={16} aria-hidden /> Editar datos (vacunas, peso…)
            </button>
          )}
          <Link
            href={`/mascotas-perdidas/${pet.id}`}
            className="btn btn-primary"
            style={{ textAlign: "center" }}
          >
            Ver perfil completo
          </Link>
          </>
          )}
        </div>

        <ConfirmDialog
          open={showCerrar}
          title="Cerrar publicación"
          message={`¿Cerrar la publicación de ${
            pet.name ?? "esta mascota"
          }? Se marca como resuelta y deja de mostrarse en el listado.`}
          confirmLabel="Sí, cerrar"
          cancelLabel="Cancelar"
          busy={busy}
          onConfirm={cerrarPublicacion}
          onCancel={() => setShowCerrar(false)}
        />

        <ConfirmDialog
          open={showDevolver}
          title="Devolver al dueño"
          message={`¿Confirmás que ${
            pet.name ?? "esta mascota"
          } fue devuelta a ${
            pet.ownerName ?? "su dueño"
          }? Se cierra la publicación como "Devuelta al dueño" y se cancelan las adopciones y seguimientos en curso.`}
          confirmLabel="Sí, devolver"
          cancelLabel="Cancelar"
          busy={busy}
          onConfirm={devolverAlDueno}
          onCancel={() => setShowDevolver(false)}
        />
      </aside>
    </div>
  );
}

/** Formulario de edición de la ficha (vacunas, peso, datos), embebido en el drawer. */
function MascotaFichaForm({
  form,
  setField,
}: {
  form: EditForm;
  setField: <K extends keyof EditForm>(key: K, value: EditForm[K]) => void;
}) {
  return (
    <div className="mdrawer-ficha-form">
      <div className="vdrawer-section">
        <h3>Datos</h3>
        <div className="vdrawer-edit-field">
          <label className="vdrawer-edit-label" htmlFor="ficha-name">Nombre</label>
          <input
            id="ficha-name"
            className="vdrawer-input"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div className="mdrawer-ficha-row">
          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="ficha-breed">Raza</label>
            <input
              id="ficha-breed"
              className="vdrawer-input"
              value={form.breed}
              onChange={(e) => setField("breed", e.target.value)}
            />
          </div>
          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="ficha-color">Color</label>
            <input
              id="ficha-color"
              className="vdrawer-input"
              value={form.color}
              onChange={(e) => setField("color", e.target.value)}
            />
          </div>
        </div>
        <div className="mdrawer-ficha-row">
          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="ficha-sex">Sexo</label>
            <ComboSelect<PetSex>
              id="ficha-sex"
              value={form.sex}
              options={[
                { value: "macho", label: "Macho" },
                { value: "hembra", label: "Hembra" },
              ]}
              placeholder="—"
              searchable={false}
              onChange={(v) => setField("sex", v)}
            />
          </div>
          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="ficha-weight">Peso (kg)</label>
            <input
              id="ficha-weight"
              type="number"
              step="0.1"
              min="0"
              className="vdrawer-input"
              value={form.weightKg}
              onChange={(e) => setField("weightKg", e.target.value)}
            />
          </div>
        </div>
        <div className="vdrawer-edit-field">
          <label className="vdrawer-edit-label" htmlFor="ficha-desc">
            Personalidad / descripción
          </label>
          <textarea
            id="ficha-desc"
            className="vdrawer-textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>
      </div>

      <div className="vdrawer-section">
        <h3>Estado sanitario y comportamiento</h3>
        <div className="mdrawer-ficha-checks">
          {EDIT_CHECKS.map((c) => (
            <label key={c.key} className="mdrawer-check">
              <input
                type="checkbox"
                checked={!!form[c.key]}
                onChange={(e) => setField(c.key, e.target.checked as EditForm[typeof c.key])}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
