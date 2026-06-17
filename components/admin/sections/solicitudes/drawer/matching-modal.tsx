"use client";

import { createPortal } from "react-dom";
import { X, Calculator, Info } from "lucide-react";
import type { AdoptionDetail } from "@/types/adoption-detail";

type Props = { detail: AdoptionDetail; onClose: () => void };

export function MatchingModal({ detail, onClose }: Props) {
  const factors = detail.compatibilityFactors || [];
  
  // Calculate total modifiers
  const sumModifiers = factors.reduce((acc, factor) => acc + factor.scoreImpact, 0);
  const rawScore = sumModifiers;
  const finalScore = Math.max(0, Math.min(100, rawScore));

  return createPortal(
    <div className="sdet-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="sdet-modal sdet-modal--lg"
        role="dialog"
        aria-label="Detalle del cálculo de compatibilidad"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px" }} // Un poco más ancho para la tabla
      >
        <div className="sdet-modal-head">
          <h2>Detalle del cálculo de compatibilidad</h2>
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
          {factors.length === 0 ? (
            <div className="sdet-modal-loading">
              No hay datos de compatibilidad detallados para esta solicitud.
            </div>
          ) : (
            <>
              <div className="table-container" style={{ margin: "1rem 0" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>Criterio evaluado</th>
                      <th style={{ width: "30%" }}>Respuesta del solicitante</th>
                      <th style={{ width: "30%" }}>Dato de la mascota</th>
                      <th style={{ width: "15%", textAlign: "right" }}>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factors.map((f, i) => (
                      <tr key={i}>
                        <td><strong>{f.criteria}</strong></td>
                        <td>{f.applicantValue}</td>
                        <td>{f.petValue}</td>
                        <td style={{ textAlign: "right", fontWeight: "bold", color: f.scoreImpact > 0 ? "var(--success)" : f.scoreImpact < 0 ? "var(--danger)" : "inherit" }}>
                          {f.scoreImpact > 0 ? `+${f.scoreImpact}` : f.scoreImpact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <section className="sdet-modal-section" style={{ backgroundColor: "var(--gray-50)", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--gray-200)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                  <Calculator size={16} aria-hidden style={{ marginRight: "0.5rem" }}/>
                  <span style={{ fontWeight: 600 }}>Resumen del cálculo</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1rem" }}>
                  <div>Puntaje base inicial:</div>
                  <strong>0</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1rem", margin: "0.5rem 0", paddingBottom: "0.5rem", borderBottom: "1px solid var(--gray-200)" }}>
                  <div>Suma de modificadores:</div>
                  <strong style={{ color: sumModifiers > 0 ? "var(--success)" : sumModifiers < 0 ? "var(--danger)" : "inherit" }}>
                    {sumModifiers > 0 ? `+${sumModifiers}` : sumModifiers}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.125rem" }}>
                  <div>Total matemático:</div>
                  <strong>{rawScore}</strong>
                </div>
                
                <div style={{ display: "flex", alignItems: "flex-start", marginTop: "1rem", color: "var(--gray-600)", fontSize: "0.875rem", gap: "0.5rem" }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ margin: 0 }}>
                    El puntaje ideal es de <strong>100 puntos</strong> en caso de ser 100% compatible. 
                    El puntaje arranca en 0 y solo suma puntos positivos por cada criterio cumplido (a excepción de reglas eliminatorias como las alergias). 
                    Por lo tanto, el puntaje final asignado es de <strong>{finalScore} puntos</strong>.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
