"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, X } from "lucide-react";
import { Loading } from "../../ui/loading";
import { Pill } from "../../ui/pill";
import { useSolicitudDetail } from "../hook/useSolicitudDetail";
import { compatTone } from "../dashboard/dashboard.data";

export function SolicitudDetailView({ id, onBack }: { id: string; onBack: () => void }) {
  const { data, loading } = useSolicitudDetail(id);
  const [activeTab, setActiveTab] = useState("Resumen");

  if (loading) return <Loading />;
  if (!data) return <div style={{ padding: 32 }}>No se encontró la solicitud</div>;

  const pct = data.compatibilityScore ?? null;
  let compatLabel = "Sin evaluar";
  if (pct !== null) {
    if (pct >= 85) compatLabel = "Muy buena";
    else if (pct >= 60) compatLabel = "Buena";
    else compatLabel = "Baja";
  }

  const tone = compatTone(pct);

  const tabs = ["Resumen", "Mensajes", "Evaluación", "Historial", "Notas"];

  return (
    <div className="sd-overlay">
      <div className="sd-card">
        
        {/* Close Button Floating */}
        <button 
          onClick={onBack}
          className="sd-close-btn"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="sd-header">
          <button
            onClick={onBack}
            className="sd-back-btn"
          >
            <ArrowLeft size={16} />
            Volver a solicitudes
          </button>
          <h1 className="sd-title">Detalle de solicitud #{id}</h1>
          <div className="sd-header-actions">
            <button className="sd-btn-primary">
              Cambiar estado
            </button>
          </div>
        </div>

        {/* Top Grid */}
        <div className="sd-grid">
          {/* General Info */}
          <div className="sd-section">
            <h2 className="sd-section-title">Información general</h2>
            <div className="sd-info-row">
              <div className="sd-info-block">
                <div className="sd-info-avatar">
                  {data.user?.photo ? (
                    <img src={data.user.photo} alt="user" />
                  ) : (
                    <div className="sd-info-avatar-placeholder">U</div>
                  )}
                </div>
                <div className="sd-info-col">
                  <span className="sd-label">Usuario</span>
                  <span className="sd-value">
                    {data.applicant?.firstName} {data.applicant?.lastName}
                  </span>
                  <span className="sd-value-sub">{data.applicant?.email}</span>
                  <span className="sd-value-sub">Tel: {data.applicant?.phone}</span>
                </div>
              </div>

              <div className="sd-info-col">
                <span className="sd-label">Mascota</span>
                <span className="sd-value">{data.pet?.name}</span>
                <span className="sd-value-sub">
                  {data.preferredAnimalLabel}
                </span>
              </div>
            </div>

            <div className="sd-info-footer">
              <div className="sd-info-footer-row">
                <span className="sd-label">Fecha de solicitud</span>
                <span className="sd-value">
                  {new Date(data.createdAt).toLocaleString("es-ES")}
                </span>
              </div>
              <div className="sd-info-footer-row" style={{ alignItems: "flex-start" }}>
                <span className="sd-label" style={{ marginBottom: 4 }}>Estado actual</span>
                <Pill tone={data.status === "NUEVA" ? "violet" : "gray"}>
                  {data.statusLabel}
                </Pill>
              </div>
            </div>
          </div>

          {/* Compatibility */}
          <div className="sd-section sd-section-sm-gap">
            <h2 className="sd-section-title">Compatibilidad</h2>
            <div className="sd-compat-header">
              <span className="sd-compat-pct">
                {pct !== null ? `${pct}%` : "N/A"}
              </span>
              {pct !== null && (
                <Pill tone={tone} className="mb-1">
                  {compatLabel}
                </Pill>
              )}
            </div>

            {/* Progress bar */}
            <div className="sd-progress-bg">
              <div
                className={`sd-progress-fill ${
                  tone === "green" ? "green" : tone === "amber" ? "amber" : tone === "red" ? "red" : ""
                }`}
                style={{ width: `${pct ?? 0}%` }}
              />
            </div>

            <div className="sd-factors">
              <span className="sd-factor-label">Factores principales</span>
              <ul className="sd-factor-list">
                {data.compatibilityFactors?.map((f: any, i: number) => (
                  <li key={i} className="sd-factor-item">
                    {f.isPositive ? (
                      <CheckCircle2 size={16} className="sd-icon-pos" />
                    ) : (
                      <XCircle size={16} className="sd-icon-neg" />
                    )}
                    {f.label}
                  </li>
                ))}
                {(!data.compatibilityFactors || data.compatibilityFactors.length === 0) && (
                  <span className="sd-label" style={{ fontStyle: "italic" }}>No hay factores analizados</span>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sd-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`sd-tab ${activeTab === tab ? "active" : ""}`}
            >
              {tab} {tab === "Mensajes" && <span className="sd-tab-badge">2</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Resumen" && (
          <div className="sd-grid">
            <div className="sd-section sd-section-sm-gap">
              <h3 className="sd-section-title">Sobre el usuario</h3>
              <div className="sd-list-grid">
                <span className="sd-list-label">Vive en</span>
                <span className="sd-list-value">{data.livingSituationLabel || "No especificado"}</span>
                
                <span className="sd-list-label">Ocupación</span>
                <span className="sd-list-value">No especificado</span>
                
                <span className="sd-list-label">Experiencia previa</span>
                <span className="sd-list-value">
                  {data.experience ? "Sí" : "No"}
                </span>
                
                <span className="sd-list-label">Tiempo disponible</span>
                <span className="sd-list-value">
                  {data.activityLevelLabel || "No especificado"}
                </span>
                
                <span className="sd-list-label">Otro animales</span>
                <span className="sd-list-value">
                  {data.otherAnimalsLabel || "No especificado"}
                </span>
              </div>
            </div>

            <div className="sd-flex-col" style={{ gap: 24 }}>
              <div className="sd-section sd-section-sm-gap">
                <h3 className="sd-section-title">Motivación</h3>
                <p className="sd-text">
                  {data.experience || "Sin información proporcionada."}
                </p>
              </div>

              <div className="sd-section" style={{ padding: "20px 24px" }}>
                <div className="sd-action-row">
                  <div className="sd-action-row-col">
                    <h3 className="sd-section-title">Próximo paso sugerido</h3>
                    <span className="sd-value" style={{ marginTop: 4 }}>Entrevista presencial</span>
                  </div>
                  <button className="sd-btn-outline">
                    Programar entrevista
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "Resumen" && (
          <div className="sd-construction">
            Contenido de la pestaña {activeTab} en construcción.
          </div>
        )}
      </div>
    </div>
  );
}
