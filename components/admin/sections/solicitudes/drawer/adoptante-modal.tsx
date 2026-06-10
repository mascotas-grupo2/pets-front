"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Users, MapPin, Home, Heart, PawPrint } from "lucide-react";
import { getAdoptionById } from "@/services/adoptions";
import type { AdoptionDetail } from "@/types/adoption-detail";
import type { Solicitud } from "../solicitudes.data";

type Props = { solicitud: Solicitud; onClose: () => void };

function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export function AdoptanteModal({ solicitud, onClose }: Props) {
  const [detail, setDetail] = useState<AdoptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getAdoptionById(solicitud.id).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data) setDetail(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [solicitud.id]);

  const a = detail; // alias corto

  return createPortal(
    <div className="sdet-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="sdet-modal sdet-modal--lg"
        role="dialog"
        aria-label="Perfil del adoptante"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sdet-modal-head">
          <h2>Perfil del adoptante</h2>
          <button
            type="button"
            className="vdrawer-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sdet-modal-body">
          {loading && (
            <div className="sdet-modal-loading">Cargando perfil...</div>
          )}

          {!loading && !a && (
            <div className="sdet-modal-loading">
              No se pudo cargar el perfil.
            </div>
          )}

          {!loading && a && (
            <>
              {/* Datos personales */}
              <section className="sdet-modal-section">
                <p className="sdet-modal-section-title">
                  <Users size={14} aria-hidden />
                  Datos personales
                </p>
                <dl className="sdet-modal-dl">
                  <div className="sdet-modal-dl-row">
                    <dt>Nombre</dt>
                    <dd>
                      {val(`${a.applicant.firstName} ${a.applicant.lastName}`)}
                    </dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Email</dt>
                    <dd>{val(a.applicant.email)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Teléfono</dt>
                    <dd>{val(a.applicant.phone)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Animal preferido</dt>
                    <dd>{val(a.preferredAnimalLabel)}</dd>
                  </div>
                </dl>
              </section>

              {/* Domicilio */}
              <section className="sdet-modal-section">
                <p className="sdet-modal-section-title">
                  <MapPin size={14} aria-hidden />
                  Domicilio
                </p>
                <dl className="sdet-modal-dl">
                  <div className="sdet-modal-dl-row">
                    <dt>Dirección</dt>
                    <dd>
                      {val(a.addressLine1)}
                      {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                    </dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Localidad</dt>
                    <dd>{val(a.town)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>CP</dt>
                    <dd>{val(a.postcode)}</dd>
                  </div>
                </dl>
              </section>

              {/* Vivienda y convivencia */}
              <section className="sdet-modal-section">
                <p className="sdet-modal-section-title">
                  <Home size={14} aria-hidden />
                  Vivienda y convivencia
                </p>
                <dl className="sdet-modal-dl">
                  <div className="sdet-modal-dl-row">
                    <dt>Tipo de vivienda</dt>
                    <dd>{val(a.livingSituationLabel)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Entorno</dt>
                    <dd>{val(a.householdSettingLabel)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Jardín / patio</dt>
                    <dd>{val(a.hasGardenLabel)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Adultos</dt>
                    <dd>{val(a.adults)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Niños convivientes</dt>
                    <dd>{val(a.children)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Niños de visita</dt>
                    <dd>{val(a.visitingChildrenLabel)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Compañeros de piso</dt>
                    <dd>{val(a.hasFlatmatesLabel)}</dd>
                  </div>
                </dl>
              </section>

              {/* Estilo de vida */}
              <section className="sdet-modal-section">
                <p className="sdet-modal-section-title">
                  <Heart size={14} aria-hidden />
                  Estilo de vida
                </p>
                <dl className="sdet-modal-dl">
                  <div className="sdet-modal-dl-row">
                    <dt>Nivel de actividad</dt>
                    <dd>{val(a.activityLevelLabel)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Alergias</dt>
                    <dd>{val(a.allergies)}</dd>
                  </div>
                </dl>
              </section>

              {/* Otros animales */}
              <section className="sdet-modal-section">
                <p className="sdet-modal-section-title">
                  <PawPrint size={14} aria-hidden />
                  Otros animales
                </p>
                <dl className="sdet-modal-dl">
                  <div className="sdet-modal-dl-row">
                    <dt>Tiene otros animales</dt>
                    <dd>{val(a.otherAnimalsLabel)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Detalle</dt>
                    <dd>{val(a.otherAnimalsDetail)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Castrado</dt>
                    <dd>{val(a.neuteredLabel)}</dd>
                  </div>
                  <div className="sdet-modal-dl-row">
                    <dt>Vacunado</dt>
                    <dd>{val(a.vaccinatedLabel)}</dd>
                  </div>
                </dl>
              </section>

              {/* Experiencia */}
              {a.experience && (
                <section className="sdet-modal-section">
                  <p className="sdet-modal-section-title">
                    <Heart size={14} aria-hidden />
                    Experiencia con animales
                  </p>
                  <p className="sdet-modal-text">{a.experience}</p>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
