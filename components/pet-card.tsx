import Link from "next/link";
import { Pet, PetReportStatus } from "@/types/pet";

/** Etiqueta y tono del estado de validación de la publicación. */
const REPORT_STATUS_META: Record<
  PetReportStatus,
  { label: string; tone: string }
> = {
  pendiente: { label: "Pendiente de revisión", tone: "pending" },
  activo: { label: "Publicado", tone: "active" },
  finalizado: { label: "Finalizado", tone: "done" },
  rechazado: { label: "Rechazado", tone: "rejected" },
};

export function PetCard({
  pet,
  showReportStatus = false,
}: {
  pet: Pet;
  /** Muestra el estado de validación (pendiente/publicado/finalizado). Usar en "Mis reportes". */
  showReportStatus?: boolean;
}) {
  const reportMeta =
    showReportStatus && pet.reportStatus
      ? REPORT_STATUS_META[pet.reportStatus]
      : null;

  return (
    <li className="pet-card">
      <Link href={`/mascotas-perdidas/${pet.id}`} className="pet-photo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Array.isArray(pet.photos) && pet.photos.length > 0 ? pet.photos[0] : "/images/pet-dog.png"} alt={pet.name ?? pet.description} />
        <span className="pet-badge">{pet.status && pet.status.toLocaleUpperCase() || "PERDIDO"}</span>
        {reportMeta && (
          <span className={`pet-report-badge pet-report-badge--${reportMeta.tone}`}>
            {reportMeta.label}
          </span>
        )}
      </Link>
      <div className="pet-body">
        <h3 className="pet-title">
          {pet.name ??
            pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1)}
        </h3>
        <p className="pet-desc">{pet.description}</p>
        <div className="pet-meta">
          <span>📍 {pet.location}</span>
          <span>📅 {pet.date}</span>
        </div>
        <div className="pet-card-footer">
          <Link href={`/mascotas-perdidas/${pet.id}`} className="pet-card-cta">
            Ver más info →
          </Link>
        </div>
      </div>
    </li>
  );
}
