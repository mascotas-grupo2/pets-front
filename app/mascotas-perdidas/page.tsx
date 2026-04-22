"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pet, AnimalType } from "@/types/pet";
import { getPets } from "@/lib/storage";
import { PetCard } from "@/components/pet-card";

type Filter = AnimalType | "todos";
type SortBy = "recientes" | "antiguos" | "nombre";
type Size = "pequeño" | "mediano" | "grande";
type Sex = "cualquiera" | "macho" | "hembra";
type DateFilter = "todos" | "hoy" | "semana" | "mes";
type Age = "cachorro" | "joven" | "adulto" | "senior";

const TYPE_FILTERS: { value: Filter; label: string; icon: string }[] = [
  { value: "todos", label: "Todos", icon: "🐾" },
  { value: "perro", label: "Perros", icon: "🐶" },
  { value: "gato", label: "Gatos", icon: "🐱" },
  { value: "otro", label: "Otros", icon: "🐰" },
];

const SIZE_OPTIONS: { value: Size; label: string }[] = [
  { value: "pequeño", label: "Pequeño" },
  { value: "mediano", label: "Mediano" },
  { value: "grande", label: "Grande" },
];

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "cualquiera", label: "Cualquiera" },
  { value: "macho", label: "Macho" },
  { value: "hembra", label: "Hembra" },
];

const AGE_OPTIONS: { value: Age; label: string }[] = [
  { value: "cachorro", label: "Cachorro" },
  { value: "joven", label: "Joven" },
  { value: "adulto", label: "Adulto" },
  { value: "senior", label: "Senior" },
];

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Últimos 7 días" },
  { value: "mes", label: "Últimos 30 días" },
];

const PAGE_SIZE = 9;

export default function LostPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recientes");
  const [sizes, setSizes] = useState<Size[]>([]);
  const [ages, setAges] = useState<Age[]>([]);
  const [sex, setSex] = useState<Sex>("cualquiera");
  const [dateFilter, setDateFilter] = useState<DateFilter>("todos");
  const [hasCollar, setHasCollar] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setPets(getPets());
  }, []);

  const toggleInArray = <T,>(arr: T[], value: T, setter: (v: T[]) => void) => {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const result = pets.filter((p) => {
      if (filter !== "todos" && p.animalType !== filter) return false;
      if (location && !p.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.name ?? "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (dateFilter !== "todos") {
        const created = new Date(p.createdAt).getTime();
        const days = { hoy: 1, semana: 7, mes: 30 }[dateFilter];
        if (now - created > days * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });

    switch (sortBy) {
      case "recientes":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "antiguos":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "nombre":
        result.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        break;
    }

    return result;
  }, [pets, filter, search, location, sortBy, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const clearFilters = () => {
    setFilter("todos");
    setSearch("");
    setLocation("");
    setSortBy("recientes");
    setSizes([]);
    setAges([]);
    setSex("cualquiera");
    setDateFilter("todos");
    setHasCollar(false);
    setPage(1);
  };

  const activeFilters =
    (filter !== "todos" ? 1 : 0) +
    (search ? 1 : 0) +
    (location ? 1 : 0) +
    (sortBy !== "recientes" ? 1 : 0) +
    sizes.length +
    ages.length +
    (sex !== "cualquiera" ? 1 : 0) +
    (dateFilter !== "todos" ? 1 : 0) +
    (hasCollar ? 1 : 0);

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Mascotas perdidas</h1>
          <p>Explorá las publicaciones y ayudá a reunirlas con su familia.</p>
        </div>
      </div>

      <div className="container listing-layout">
        <aside
          className={`listing-sidebar${filtersOpen ? " open" : ""}`}
          aria-label="Filtros"
        >
          <div className="sidebar-header">
            <h3>Filtros</h3>
            {activeFilters > 0 && (
              <button
                type="button"
                className="sidebar-clear"
                onClick={clearFilters}
              >
                Limpiar ({activeFilters})
              </button>
            )}
          </div>

          <div className="sidebar-types">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`sidebar-type${filter === f.value ? " active" : ""}`}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                aria-label={f.label}
              >
                <span className="sidebar-type-icon" aria-hidden>
                  {f.icon}
                </span>
                <span className="sidebar-type-label">{f.label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-block">
            <label className="sidebar-label" htmlFor="listing-search">
              Buscar
            </label>
            <input
              id="listing-search"
              className="input"
              type="search"
              placeholder="Nombre, descripción…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="sidebar-block">
            <label className="sidebar-label" htmlFor="listing-location">
              Ubicación
            </label>
            <input
              id="listing-location"
              className="input"
              type="text"
              placeholder="Barrio o ciudad"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Fecha del reporte</span>
            <div className="sidebar-radios">
              {DATE_OPTIONS.map((opt) => (
                <label key={opt.value} className="sidebar-radio">
                  <input
                    type="radio"
                    name="date-filter"
                    checked={dateFilter === opt.value}
                    onChange={() => {
                      setDateFilter(opt.value);
                      setPage(1);
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Tamaño</span>
            <div className="sidebar-checks">
              {SIZE_OPTIONS.map((opt) => (
                <label key={opt.value} className="sidebar-check">
                  <input
                    type="checkbox"
                    checked={sizes.includes(opt.value)}
                    onChange={() => toggleInArray(sizes, opt.value, setSizes)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Edad aproximada</span>
            <div className="sidebar-checks">
              {AGE_OPTIONS.map((opt) => (
                <label key={opt.value} className="sidebar-check">
                  <input
                    type="checkbox"
                    checked={ages.includes(opt.value)}
                    onChange={() => toggleInArray(ages, opt.value, setAges)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Sexo</span>
            <div className="sidebar-radios">
              {SEX_OPTIONS.map((opt) => (
                <label key={opt.value} className="sidebar-radio">
                  <input
                    type="radio"
                    name="sex-filter"
                    checked={sex === opt.value}
                    onChange={() => setSex(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <label className="sidebar-check sidebar-check-standalone">
              <input
                type="checkbox"
                checked={hasCollar}
                onChange={(e) => setHasCollar(e.target.checked)}
              />
              <span>Con collar o chapa</span>
            </label>
          </div>

          <div className="sidebar-block">
            <label className="sidebar-label" htmlFor="listing-sort">
              Ordenar por
            </label>
            <select
              id="listing-sort"
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="nombre">Nombre (A-Z)</option>
            </select>
          </div>

          <Link
            href="/mascotas-perdidas/reportar"
            className="btn btn-primary btn-lg sidebar-cta"
          >
            Reportar mascota
          </Link>
        </aside>

        <section className="listing-main">
          <div className="listing-toolbar">
            <p className="listing-count">
              <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm listing-filters-toggle"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              {filtersOpen ? "Ocultar filtros" : "Filtros"}
              {activeFilters > 0 && ` (${activeFilters})`}
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="listing-empty">
              <p>No hay mascotas que coincidan con tu búsqueda.</p>
              <Link
                href="/mascotas-perdidas/reportar"
                className="btn btn-primary"
              >
                Reportar una mascota
              </Link>
            </div>
          ) : (
            <>
              <ul className="pet-grid listing-grid">
                {pageItems.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </ul>

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Paginación">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        className={`pagination-btn${n === currentPage ? " active" : ""}`}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
