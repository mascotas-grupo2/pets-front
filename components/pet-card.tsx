import Link from "next/link";
import { Pet, PetReportStatus, PetStatus } from "@/types/pet";
import { PetCardActions } from "@/components/pet-card-actions";

/** Etiqueta y tono del estado de validación de la publicación. */
const REPORT_STATUS_META: Record<
  PetReportStatus,
  { label: string; tone: string }
> = {
  pendiente: { label: "Pendiente de revisión", tone: "pending" },
  activo: { label: "Publicado", tone: "active" },
  finalizado: { label: "Finalizado", tone: "done" },
  rechazado: { label: "Rechazado", tone: "rejected" },
  reservada: { label: "Reservada", tone: "active" },
};

/** Tono de color del badge según el estado real de la mascota. */
const STATUS_TONE: Record<PetStatus, string> = {
  perdido: "perdido",
  encontrado: "encontrado",
  "en tránsito": "transito",
  "en tratamiento médico": "medico",
  "en adopción": "adopcion",
  adoptado: "adoptado",
  "devuelta al dueño": "done",
};

/** Imagen por defecto según el tipo de animal (assets reales del proyecto). */
function placeholderFor(animalType: Pet["animalType"]): string {
  return animalType === "gato" ? "/images/pet-cat.jpg" : "/images/pet-dog.jpg";
}

/** "Hace 3 días" / "Hoy" a partir de una fecha ISO. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffDays = Math.floor((Date.now() - then) / 86_400_000);
  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} año(s)`;
}

/** Rasgos destacables de la mascota (solo los presentes/verdaderos). */
function petTraits(pet: Pet): string[] {
  const traits: string[] = [];
  if (pet.hasCollar || pet.hasTag) traits.push("Collar/chapa");
  if (pet.vaccinated) traits.push("Vacunado/a");
  if (pet.neutered) traits.push("Castrado/a");
  if (pet.microchipped) traits.push("Microchip");
  if (pet.friendlyWithKids) traits.push("Bien con chicos");
  return traits;
}

export function PetCard({
  pet,
  showReportStatus = false,
  manageable = false,
  onDelete,
  onResolve,
}: {
  pet: Pet;
  /** Muestra el estado de validación (pendiente/publicado/finalizado). Usar en "Mis reportes". */
  showReportStatus?: boolean;
  /** Muestra acciones de dueño (editar / eliminar / marcar como aparecida). */
  manageable?: boolean;
  onDelete?: (pet: Pet) => void;
  onResolve?: (pet: Pet) => void;
}) {
  const reportMeta =
    showReportStatus && pet.reportStatus
      ? REPORT_STATUS_META[pet.reportStatus]
      : null;

  const href = `/mascotas-perdidas/${pet.id}`;
  const tone = STATUS_TONE[pet.status] ?? "perdido";
  const traits = petTraits(pet);
  const visibleTraits = traits.slice(0, 3);
  const extraTraits = traits.length - visibleTraits.length;
  const when = relativeTime(pet.date || pet.createdAt);

  // Subtítulo compacto: tipo · raza · sexo (solo los datos disponibles).
  const subtitleParts = [
    pet.animalTypeLabel ??
      pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1),
    pet.breed,
    pet.sex === "macho" ? "Macho" : pet.sex === "hembra" ? "Hembra" : undefined,
  ].filter(Boolean);

  return (
    <li className="pet-card">
      <Link href={href} className="pet-photo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            Array.isArray(pet.photos) && pet.photos.length > 0
              ? pet.photos[0]
              : placeholderFor(pet.animalType)
          }
          alt={pet.name ?? pet.description}
        />
        <span className={`pet-badge pet-badge--${tone}`}>
          {(pet.statusLabel ?? pet.status)?.toLocaleUpperCase() || "PERDIDO"}
        </span>
        {pet.status === "perdido" && pet.isOwner && !reportMeta && (
          <span
            className="pet-report-badge"
            style={{ background: "var(--primary-500)", right: "12px" }}
          >
            Con dueño
          </span>
        )}
        {when && <span className="pet-when">{when}</span>}
        {reportMeta && (
          <span
            className={`pet-report-badge pet-report-badge--${reportMeta.tone}`}
          >
            {reportMeta.label}
          </span>
        )}
      </Link>
      <div className="pet-body">
        <div className="pet-headline">
          <h3 className="pet-title">
            {pet.name ??
              pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1)}
          </h3>
          {subtitleParts.length > 0 && (
            <p className="pet-subtitle">{subtitleParts.join(" · ")}</p>
          )}
        </div>

        <p className="pet-desc">{pet.description}</p>

        {showReportStatus &&
          pet.reportStatus === "rechazado" &&
          pet.rejectionReason && (
            <p className="pet-reject-reason">
              <strong>Motivo del rechazo:</strong> {pet.rejectionReason}
            </p>
          )}

        {visibleTraits.length > 0 && (
          <ul className="pet-traits" aria-label="Características">
            {visibleTraits.map((t) => (
              <li key={t} className="pet-trait">
                {t}
              </li>
            ))}
            {extraTraits > 0 && (
              <li className="pet-trait pet-trait--more">+{extraTraits}</li>
            )}
          </ul>
        )}

        <div className="pet-meta">
          {pet.refugioName && (
            <span className="pet-refugio" title={`Publicada por ${pet.refugioName}`}>
              🏠 {pet.refugioName}
            </span>
          )}
          <span>📍 {pet.location}</span>
          <span>📅 {pet.date}</span>
          {typeof pet.daysLeft === "number" && (
            <span className={`pet-expiry${pet.expired ? " pet-expiry--over" : ""}`}>
              {pet.expired
                ? "⏳ Publicación vencida"
                : `⏳ Vence en ${pet.daysLeft} día${pet.daysLeft === 1 ? "" : "s"}`}
            </span>
          )}
        </div>

        <PetCardActions pet={pet} />

        {manageable && (
          <div className="pet-card-manage">
            <Link href={`${href}/editar`} className="btn btn-outline btn-sm">
              Editar
            </Link>
            {onResolve &&
              pet.reportStatus !== "finalizado" &&
              pet.status !== "en adopción" &&
              pet.status !== "adoptado" &&
              !pet.isOwner && (
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => onResolve(pet)}
                >
                  Apareció
                </button>
              )}
            {onDelete && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(pet)}
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
