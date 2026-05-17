"use client";

import { AdminSubnav } from "@/components/admin-subnav";
import { useAdminGuard } from "@/components/admin/use-admin-guard";
import {
  PET_MEDICAL_CHIP_CLASS,
  PET_STATUS_CHIP_CLASS,
  PET_STATUS_OPTIONS,
} from "@/lib/admin/pet-status";
import { getAdminPets } from "@/services/mascotas.pets";
import { AdminPetSummary, PetStatus } from "@/types/pet";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STATUS_FILTERS: { value: PetStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  ...PET_STATUS_OPTIONS,
];

export default function AdminMascotasPerdidasPage() {
  const { blocked } = useAdminGuard();
  const [pets, setPets] = useState<AdminPetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PetStatus | "todos">(
    "todos",
  );

  useEffect(() => {
    getAdminPets()
      .then((res) => {
        if (res?.ok && res.data) setPets(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      if (statusFilter !== "todos" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          (p.name ?? "").toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [pets, search, statusFilter]);

  if (blocked) return null;

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Panel de admin — Mascotas</h1>
          <p>
            Editá el estado de las mascotas (médico, tránsito, adopción, etc) y
            agregá notas de seguimiento.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 0" }}>
        <AdminSubnav />

        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <label className="field-label" htmlFor="admin-search">
              Buscar
            </label>
            <input
              id="admin-search"
              className="input"
              type="search"
              placeholder="Nombre, ubicación, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-toolbar-filter">
            <label className="field-label" htmlFor="admin-status">
              Estado
            </label>
            <select
              id="admin-status"
              className="select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as PetStatus | "todos")
              }
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <p className="admin-toolbar-count">
            <strong>{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "mascota" : "mascotas"}
          </p>
        </div>

        {loading ? (
          <p style={{ padding: "2rem 0", textAlign: "center" }}>Cargando…</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "2rem 0", textAlign: "center" }}>
            No se encontraron mascotas con esos filtros.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Estado médico</th>
                  <th>Interesados</th>
                  <th>Reportado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pet) => (
                  <tr key={pet.id}>
                    <td>
                      <div className="admin-thumb">
                        {pet.photos && pet.photos.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pet.photos[0]} alt={pet.name ?? ""} />
                        ) : (
                          <span aria-hidden>🐾</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{pet.name ?? "—"}</strong>
                      <div className="admin-id">
                        {pet.id.slice(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {pet.animalType}
                    </td>
                    <td>{pet.location}</td>
                    <td>
                      <span
                        className={
                          PET_STATUS_CHIP_CLASS[pet.status] ?? "admin-chip"
                        }
                      >
                        {pet.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          PET_MEDICAL_CHIP_CLASS[pet.medicalStatus] ??
                          "admin-chip"
                        }
                      >
                        {pet.medicalStatus}
                      </span>
                    </td>
                    <td>
                      {pet.adoptionInterestCount > 0 ? (
                        <strong>{pet.adoptionInterestCount}</strong>
                      ) : (
                        <span style={{ color: "var(--gray-500)" }}>—</span>
                      )}
                    </td>
                    <td>
                      {new Date(pet.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <Link
                        href={`/admin/mascotas-perdidas/${pet.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
