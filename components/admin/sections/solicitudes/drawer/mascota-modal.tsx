"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X, PawPrint,  Info } from "lucide-react";
import type { AdoptionDetail } from "@/types/adoption-detail";
import type { Solicitud } from "../solicitudes.data";
import { getAdoptionById } from "@/services/adoptions";

type Props = { solicitud: Solicitud; onClose: () => void };

function val(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v);
}

export function MascotaModal({ solicitud, onClose }: Props) {
  const [detail, setDetail] = useState<AdoptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getAdoptionById(solicitud.id).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data) setDetail(res.data as AdoptionDetail);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [solicitud.id]);

  const pet = detail?.pet ?? null;

  return createPortal(
    <div className="sdet-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="sdet-modal sdet-modal--md"
        role="dialog"
        aria-label="Perfil de la mascota"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sdet-modal-head">
          <h2>Mascota{pet?.name ? `: ${pet.name}` : ""}</h2>
          <button type="button" className="vdrawer-close" aria-label="Cerrar" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sdet-modal-body">
          {loading && (
            <div className="sdet-modal-loading">Cargando mascota...</div>
          )}

          {!loading && !pet && (
            <div className="sdet-modal-loading">No se encontró información de la mascota.</div>
          )}

          {!loading && pet && (
            <>
              {/* Foto + datos básicos */}
              <section className="sdet-modal-section sdet-modal-section--row">
                {pet.photo ? (
                  <Image
                    className="sdet-mascota-photo"
                    src={pet.photo}
                    alt={pet.name ?? "Mascota"}
                    width={120}
                    height={120}
                    unoptimized
                  />
                ) : (
                  <div className="sdet-mascota-photo sdet-mascota-photo--empty">
                    <PawPrint size={28} />
                  </div>
                )}
                <dl className="sdet-modal-dl" style={{ flex: 1 }}>
                  <div className="sdet-modal-dl-row">
                    <dt>Nombre</dt>
                    <dd>{val(pet.name)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>ID</dt>
                    <dd style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {pet.id}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Nota: el endpoint actual del detail devuelve datos básicos de la mascota.
                  Para datos médicos completos (edad, raza, peso, etc.) necesitás
                  un endpoint GET /pets/:id por separado. */}
              <section className="sdet-modal-section">
                <p className="sdet-modal-section-title">
                  <Info size={14} aria-hidden />
                  Información
                </p>
                <p className="sdet-modal-text" style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}>
                  Para ver el perfil completo de la mascota con datos médicos,
                  abrí su publicación desde la sección Mascotas.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
