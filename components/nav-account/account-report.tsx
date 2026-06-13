import React, { useEffect, useState } from "react";
import { PetCard } from "../pet-card";
import { AnimalType, Pet, PetStatus } from "@/types/pet";
import { PetComment } from "@/types/pet-comment";
import { getOwnerComments, approveComment, rejectComment } from "@/services/pet-comments";
import { Check, X, Eye, MessageSquare } from "lucide-react";

interface MyReportsViewProps {
  pets: Pet[];
}

export default function MyReportsView({ pets }: MyReportsViewProps) {
  const [statusFilter, setStatusFilter] = useState<PetStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AnimalType | "all">("all");
  const [pendingComments, setPendingComments] = useState<Map<string, PetComment[]>>(new Map());
  const [loadingComments, setLoadingComments] = useState(true);

  const filteredPets = pets.filter((p) => {
    const statusMatch = statusFilter === "all" || p.status === statusFilter;
    const typeMatch = typeFilter === "all" || p.animalType === typeFilter;
    return statusMatch && typeMatch;
  });

  // Cargar comentarios pendientes para cada mascota
  useEffect(() => {
    if (pets.length === 0) return;
    setLoadingComments(true);
    Promise.all(
      pets.map((p) =>
        getOwnerComments(p.id).then((res) => ({
          id: p.id,
          comments: res?.ok && res.data ? res.data.filter((c) => c.status === "pending") : [],
        }))
      )
    ).then((results) => {
      const map = new Map<string, PetComment[]>();
      results.forEach((r) => {
        if (r.comments.length > 0) map.set(r.id, r.comments);
      });
      setPendingComments(map);
    }).finally(() => setLoadingComments(false));
  }, [pets]);

  const totalPending = Array.from(pendingComments.values()).reduce((sum, arr) => sum + arr.length, 0);

  const handleApprove = async (petId: string, commentId: string) => {
    const res = await approveComment(petId, commentId);
    if (res?.ok) {
      setPendingComments((prev) => {
        const next = new Map(prev);
        const arr = next.get(petId)?.filter((c) => c.id !== commentId) ?? [];
        if (arr.length > 0) next.set(petId, arr);
        else next.delete(petId);
        return next;
      });
    }
  };

  const handleReject = async (petId: string, commentId: string) => {
    const res = await rejectComment(petId, commentId);
    if (res?.ok) {
      setPendingComments((prev) => {
        const next = new Map(prev);
        const arr = next.get(petId)?.filter((c) => c.id !== commentId) ?? [];
        if (arr.length > 0) next.set(petId, arr);
        else next.delete(petId);
        return next;
      });
    }
  };

  return (
    <div className="my-reports-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          marginBottom: "2rem",
        }}
      >
        <div
          className="section-title"
          style={{ textAlign: "left", marginBottom: "2rem" }}
        >
          <h2>Mis Reportes</h2>
          <p style={{ marginLeft: "0" }}>
            Gestioná y filtrá tus publicaciones activas.
          </p>
        </div>

        <div
          className="filters-bar"
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div className="field" style={{ marginBottom: 0, minWidth: "180px" }}>
            <label>Estado</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as PetStatus | "all")
              }
            >
              <option value="all">Todos los estados</option>
              <option value="perdido">Perdidos</option>
              <option value="en adopción">En adopción</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: "180px" }}>
            <label>Tipo de animal</label>
            <select
              className="input"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as AnimalType | "all")
              }
            >
              <option value="all">Todos los tipos</option>
              <option value="perro">Perros</option>
              <option value="gato">Gatos</option>
              <option value="otro">Otros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comentarios pendientes de aprobación */}
      {totalPending > 0 && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem 1.25rem",
            background: "#fef0c7",
            border: "1px solid #fef0c7",
            borderRadius: "var(--radius-md)",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              color: "#b54708",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "1rem",
            }}
          >
            <MessageSquare size={16} /> {totalPending} comentario{totalPending > 1 ? "s" : ""} pendiente{totalPending > 1 ? "s" : ""} de aprobación
          </h3>
          {Array.from(pendingComments.entries()).map(([petId, comments]) => {
            const pet = pets.find((p) => p.id === petId);
            return (
              <div key={petId} style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--primary-900)", marginBottom: "0.5rem" }}>
                  {pet?.name ?? "Publicación"}
                </div>
                {comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      background: "white",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{c.authorName}</div>
                      <div style={{ fontSize: "0.82rem", color: "var(--gray-600)" }}>{c.text}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => handleApprove(petId, c.id)}
                      title="Aprobar"
                    >
                      <Check size={14} /> Aprobar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => handleReject(petId, c.id)}
                      title="Rechazar"
                    >
                      <X size={14} /> Rechazar
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {filteredPets.length === 0 ? (
        <p
          className="empty-state"
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "var(--gray-50)",
            borderRadius: "8px",
          }}
        >
          No se encontraron reportes con los filtros seleccionados.
        </p>
      ) : (
        <ul className="pet-grid">
          {filteredPets.map((p) => (
            <li key={p.id} style={{ position: "relative" }}>
              <PetCard pet={p} showReportStatus />
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  background: "rgba(17, 24, 39, 0.66)",
                  color: "#fff",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: "var(--radius-full)",
                  backdropFilter: "blur(2px)",
                  zIndex: 1,
                }}
              >
                <Eye size={12} /> {p.viewsCount ?? 0} vistas
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
