"use client";

import { useEffect, useState } from "react";
import { getMyAdoptions, type MyAdoption } from "@/services/my-adoptions";
import { getAdoptionById } from "@/services/adoptions";
import { getIdPets } from "@/services/mascotas.pets";
import type { AdoptionDetail } from "@/types/adoption-detail";
import type { Pet } from "@/types/pet";
import { Package, Clock, CheckCircle, XCircle, Eye, X, PawPrint, Info } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    NUEVA: { bg: "var(--primary-50)", color: "var(--primary-700)", label: "Nueva" },
    EN_EVALUACION: { bg: "#fef0c7", color: "#b54708", label: "En evaluación" },
    ENTREVISTA_PENDIENTE: { bg: "#e0eaff", color: "#1d4ed8", label: "Entrevista pendiente" },
    ACEPTADA_CON_SEGUIMIENTO: { bg: "#d1fadf", color: "#027a48", label: "Aceptada con seguimiento" },
    ACEPTADA: { bg: "#d1fadf", color: "#027a48", label: "Aceptada" },
    DESCARTADA: { bg: "#fde2e1", color: "#b42318", label: "Descartada" },
  };
  const c = config[status] ?? config.NUEVA;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.25rem 0.65rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: c.bg,
        color: c.color,
      }}
    >
      {status === "ACEPTADA" || status === "ACEPTADA_CON_SEGUIMIENTO" ? (
        <CheckCircle size={12} />
      ) : status === "DESCARTADA" ? (
        <XCircle size={12} />
      ) : (
        <Clock size={12} />
      )}
      {c.label}
    </span>
  );
}

function val(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v);
}

function formatAge(months?: number): string {
  if (!months) return "—";
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} a ${rest} m`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.45rem 0", borderBottom: "1px solid var(--gray-100)" }}>
      <span style={{ color: "var(--gray-500)", fontSize: "0.82rem" }}>{label}</span>
      <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--primary-900)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function PetModal({ adoption, onClose }: { adoption: MyAdoption; onClose: () => void }) {
  const [detail, setDetail] = useState<AdoptionDetail | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAdoptionById(adoption.id)
      .then(async (res) => {
        if (cancelled) return;
        if (res?.ok && res.data) {
          setDetail(res.data);
          const petId = res.data.pet?.id ?? adoption.petId;
          if (petId) {
            const petRes = await getIdPets(petId);
            if (!cancelled && petRes?.ok && petRes.data) setPet(petRes.data);
          }
        } else if (adoption.petId) {
          const petRes = await getIdPets(adoption.petId);
          if (!cancelled && petRes?.ok && petRes.data) setPet(petRes.data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adoption.id, adoption.petId]);

  const title = pet?.name ?? detail?.pet?.name ?? adoption.petName ?? "Mascota";
  const photo = pet?.photos?.[0] ?? pet?.photo ?? detail?.pet?.photo ?? adoption.petPhoto;
  const specs = [
    ["Estado solicitud", <StatusBadge key="status" status={adoption.status} />],
    ["Fecha de solicitud", new Date(adoption.createdAt).toLocaleDateString("es-AR")],
    ["Última actualización", new Date(adoption.updatedAt).toLocaleDateString("es-AR")],
    ["Tipo", val(pet?.animalTypeLabel ?? pet?.animalType)],
    ["Estado publicación", val(pet?.statusLabel ?? pet?.status)],
    ["Sexo", val(pet?.sexLabel ?? pet?.sex)],
    ["Edad", formatAge(pet?.ageMonths)],
    ["Raza", val(pet?.breed)],
    ["Color", val(pet?.color)],
    ["Peso", pet?.weightKg ? `${pet.weightKg} kg` : "—"],
    ["Altura", pet?.heightCm ? `${pet.heightCm} cm` : "—"],
    ["Ubicación", val(pet?.location)],
    ["Estado médico", val(pet?.medicalStatusLabel ?? pet?.medicalStatus)],
    ["Amigable con niños", val(pet?.friendlyWithKids)],
    ["Amigable con mascotas", val(pet?.friendlyWithPets)],
    ["Entrenado/Educado", val(pet?.trained)],
    ["Castrado", val(pet?.neutered)],
    ["Vacunado", val(pet?.vaccinated)],
  ] as const;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(31, 25, 87, 0.4)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 50px rgba(31, 25, 87, 0.25)",
          width: "100%",
          maxWidth: 760,
          maxHeight: "88vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.1rem 1.4rem",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>
            Mascota: {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--gray-400)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "var(--radius-full)",
            }}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "1.3rem 1.4rem", overflowY: "auto" }}>
          {loading ? (
            <p style={{ color: "var(--gray-500)", textAlign: "center", padding: "2rem" }}>Cargando mascota…</p>
          ) : (
            <>
              <section style={{ display: "grid", gridTemplateColumns: "minmax(180px, 240px) 1fr", gap: "1.25rem", alignItems: "start" }}>
                {photo ? (
                  <img
                    src={photo}
                    alt={title}
                    style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: "var(--radius-md)" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 220,
                      background: "var(--primary-50)",
                      borderRadius: "var(--radius-md)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--primary-500)",
                    }}
                  >
                    <PawPrint size={38} />
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", columnGap: "1.25rem" }}>
                  {specs.map(([label, value]) => (
                    <DetailRow key={label} label={label} value={value} />
                  ))}
                </div>
              </section>

              {pet?.description && (
                <section style={{ marginTop: "1.25rem" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", margin: "0 0 0.45rem", color: "var(--gray-400)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                    <Info size={14} /> Historia
                  </p>
                  <p style={{ margin: 0, color: "var(--gray-700)", lineHeight: 1.6, fontSize: "0.9rem" }}>{pet.description}</p>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyAdoptionsView() {
  const [adoptions, setAdoptions] = useState<MyAdoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdoption, setSelectedAdoption] = useState<MyAdoption | null>(null);

  useEffect(() => {
    getMyAdoptions().then((res) => {
      if (res?.ok && res.data) setAdoptions(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: "var(--gray-500)", textAlign: "center", padding: "2rem" }}>Cargando solicitudes…</p>;
  }

  if (adoptions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <Package size={48} style={{ color: "var(--gray-300)", marginBottom: "1rem" }} />
        <p style={{ color: "var(--gray-500)", fontSize: "0.95rem" }}>
          Todavía no enviaste ninguna solicitud de adopción.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>Mis Solicitudes</h3>
      <p style={{ color: "var(--gray-500)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
        Seguí el estado de tus solicitudes de adopción.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {adoptions.map((a) => (
          <div
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem 1.25rem",
              background: "var(--surface-alt)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {a.petPhoto ? (
              <img
                src={a.petPhoto}
                alt={a.petName ?? "Mascota"}
                style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-100)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--primary-500)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                🐾
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--primary-900)" }}>
                {a.petName ?? "Mascota"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                Solicitud #{a.id} · {new Date(a.createdAt).toLocaleDateString("es-AR")}
              </div>
            </div>
            <StatusBadge status={a.status} />
            <button
              type="button"
              onClick={() => setSelectedAdoption(a)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--gray-400)",
                padding: "0.25rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Ver mascota"
              aria-label="Ver mascota"
            >
              <Eye size={18} />
            </button>
          </div>
        ))}
      </div>

      {selectedAdoption && (
        <PetModal adoption={selectedAdoption} onClose={() => setSelectedAdoption(null)} />
      )}
    </div>
  );
}
