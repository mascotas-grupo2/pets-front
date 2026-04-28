import React, { useState } from "react";
import { PetCard } from "../pet-card";
import { AnimalType, Pet, PetStatus } from "@/types/pet";

interface MyReportsViewProps {
  pets: Pet[];
}

export default function MyReportsView({ pets }: MyReportsViewProps) {
  const [statusFilter, setStatusFilter] = useState<PetStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AnimalType | "all">("all");

  const filteredPets = pets.filter((p) => {
    const statusMatch = statusFilter === "all" || p.status === statusFilter;
    const typeMatch = typeFilter === "all" || p.animalType === typeFilter;
    return statusMatch && typeMatch;
  });

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
            <PetCard key={p.id} pet={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
