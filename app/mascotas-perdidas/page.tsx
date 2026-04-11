"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pet, AnimalType } from "@/types/pet";
import { getPets } from "@/lib/storage";
import { PetCard } from "@/components/pet-card";

type Filter = AnimalType | "todos";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "perro", label: "Perros" },
  { value: "gato", label: "Gatos" },
  { value: "otro", label: "Otros" },
];

export default function LostPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPets(getPets());
  }, []);

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      if (filter !== "todos" && p.animalType !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.name ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pets, filter, search]);

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Mascotas perdidas</h1>
          <p>Explorá las publicaciones y ayudá a reunirlas con su familia.</p>
        </div>
      </div>

      <div className="container" style={{ marginBottom: "2rem" }}>
        <div style={{ maxWidth: 480, margin: "0 auto 1.5rem" }}>
          <input
            className="input"
            type="search"
            placeholder="Buscar por nombre, zona o descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-chip${filter === f.value ? " active" : ""}`}
              onClick={() => setFilter(f.value)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ marginBottom: "1.5rem" }}>
              No hay mascotas que coincidan con tu búsqueda.
            </p>
            <Link
              href="/mascotas-perdidas/reportar"
              className="btn btn-primary"
            >
              Reportar una mascota perdida
            </Link>
          </div>
        ) : (
          <ul className="pet-grid">
            {filtered.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
