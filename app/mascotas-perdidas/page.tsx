"use client";

import { PetCard } from "@/components/pet-card";
import { RootState } from "@/redux/store";
import { getAllPets } from "@/services/mascotas.pets";
import { AnimalType, Pet } from "@/types/pet";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  PawPrint,
  Search,
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
} from "lucide-react";
import { PetsMap } from "@/components/pets-map";
import { CatLoader } from "@/components/cat-loader";

type Filter = AnimalType | "todos";
type SortBy = "urgentes" | "recientes" | "antiguos" | "nombre";
type View = "grid" | "map";

const SORT_LABELS: Record<SortBy, string> = {
  urgentes: "Más urgentes",
  recientes: "Más recientes",
  antiguos: "Más antiguos",
  nombre: "Nombre (A-Z)",
};
type Size = "pequeño" | "mediano" | "grande";
type Sex = "cualquiera" | "macho" | "hembra";
type DateFilter = "todos" | "hoy" | "semana" | "mes";
type Age = "cachorro" | "joven" | "adulto" | "senior";

interface FilterCriteria {
  type: Filter;
  search: string;
  location: string;
  sortBy: SortBy;
  sizes: Size[];
  ages: Age[];
  sex: Sex;
  dateFilter: DateFilter;
  hasCollar: boolean;
}

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
  const [page, setPage] = useState(1);
  const [pets, setPets] = useState<Pet[]>([]);
  const [referenceDate] = useState(() => Date.now());
  const [filters, setFilters] = useState<FilterCriteria>({
    type: "todos",
    search: "",
    location: "",
    sortBy: "recientes",
    sizes: [],
    ages: [],
    sex: "cualquiera",
    dateFilter: "todos",
    hasCollar: false,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<View>("grid");

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pets.length) {
      setLoading(false);
      return;
    }
    getAllPets()
      .then((res) => {
        if (res && res.ok && res.data) {
          const pets = res.data;
          setPets(pets);
          dispatch({ type: "pets/all_pets", payload: pets });
        }
      })
      .catch((error: unknown) => console.error(error))
      .finally(() => setLoading(false));
  }, [pets, dispatch]);

  const updateFilter = (changes: Partial<FilterCriteria>) => {
    setFilters((prev) => ({ ...prev, ...changes }));
    setPage(1);
  };

  const toggleInArray = <T,>(arr: T[], value: T): T[] => {
    return arr.includes(value)
      ? arr.filter((x) => x !== value)
      : [...arr, value];
  };

  const filtered = useMemo(() => {
    const petSize = (p: Pet): Size | null => {
      if (p.weightKg != null) {
        if (p.weightKg <= 10) return "pequeño";
        if (p.weightKg <= 25) return "mediano";
        return "grande";
      }
      if (p.heightCm != null) {
        if (p.heightCm <= 35) return "pequeño";
        if (p.heightCm <= 60) return "mediano";
        return "grande";
      }
      return null;
    };

    const petAge = (p: Pet): Age | null => {
      if (p.ageMonths == null) return null;
      if (p.ageMonths < 12) return "cachorro";
      if (p.ageMonths < 36) return "joven";
      if (p.ageMonths < 96) return "adulto";
      return "senior";
    };

    const basePets = pets ?? [];
    const result = basePets.filter((p) => {
      // Excluir mascotas devueltas al dueño del listado público
      if (p.status === "devuelta al dueño") return false;
      if (filters.type !== "todos" && p.animalType !== filters.type)
        return false;
      if (filters.sex !== "cualquiera" && p.sex !== filters.sex) return false;
      if (filters.hasCollar && !p.hasCollar && !p.hasTag) return false;
      if (filters.sizes.length > 0) {
        const size = petSize(p);
        if (!size || !filters.sizes.includes(size)) return false;
      }
      if (filters.ages.length > 0) {
        const age = petAge(p);
        if (!age || !filters.ages.includes(age)) return false;
      }
      if (
        filters.location &&
        !p.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesSearch =
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.name ?? "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (filters.dateFilter !== "todos") {
        const created = new Date(p.createdAt).getTime();
        const days = { hoy: 1, semana: 7, mes: 30 }[filters.dateFilter];
        if (referenceDate - created > days * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });

    switch (filters.sortBy) {
      case "urgentes": {
        // Casos activos (perdido/encontrado/en tránsito) primero, los más
        // recientes arriba; adopción/adoptado quedan al final.
        const score = (p: Pet) => {
          const active =
            p.status === "perdido" ||
            p.status === "encontrado" ||
            p.status === "en tránsito";
          const days =
            (referenceDate - new Date(p.date).getTime()) / 86_400_000;
          return (active ? 1_000_000 : 0) - days;
        };
        result.sort((a, b) => score(b) - score(a));
        break;
      }
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
  }, [pets, filters, referenceDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const petsPerPages = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const clearFilters = () => {
    setFilters({
      type: "todos",
      search: "",
      location: "",
      sortBy: "recientes",
      sizes: [],
      ages: [],
      sex: "cualquiera",
      dateFilter: "todos",
      hasCollar: false,
    });
    setPage(1);
  };

  const activeFilters =
    (filters.type !== "todos" ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.sortBy !== "recientes" ? 1 : 0) +
    filters.sizes.length +
    filters.ages.length +
    (filters.sex !== "cualquiera" ? 1 : 0) +
    (filters.dateFilter !== "todos" ? 1 : 0) +
    (filters.hasCollar ? 1 : 0);

  // Chips de filtros activos (removibles) que se muestran sobre la grilla.
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.type !== "todos")
    chips.push({
      key: "type",
      label: TYPE_FILTERS.find((t) => t.value === filters.type)!.label,
      onRemove: () => updateFilter({ type: "todos" }),
    });
  if (filters.search)
    chips.push({
      key: "search",
      label: `“${filters.search}”`,
      onRemove: () => updateFilter({ search: "" }),
    });
  if (filters.location)
    chips.push({
      key: "loc",
      label: `📍 ${filters.location}`,
      onRemove: () => updateFilter({ location: "" }),
    });
  if (filters.dateFilter !== "todos")
    chips.push({
      key: "date",
      label: DATE_OPTIONS.find((d) => d.value === filters.dateFilter)!.label,
      onRemove: () => updateFilter({ dateFilter: "todos" }),
    });
  filters.sizes.forEach((s) =>
    chips.push({
      key: `size-${s}`,
      label: SIZE_OPTIONS.find((o) => o.value === s)!.label,
      onRemove: () =>
        updateFilter({ sizes: filters.sizes.filter((x) => x !== s) }),
    })
  );
  filters.ages.forEach((a) =>
    chips.push({
      key: `age-${a}`,
      label: AGE_OPTIONS.find((o) => o.value === a)!.label,
      onRemove: () =>
        updateFilter({ ages: filters.ages.filter((x) => x !== a) }),
    })
  );
  if (filters.sex !== "cualquiera")
    chips.push({
      key: "sex",
      label: SEX_OPTIONS.find((o) => o.value === filters.sex)!.label,
      onRemove: () => updateFilter({ sex: "cualquiera" }),
    });
  if (filters.hasCollar)
    chips.push({
      key: "collar",
      label: "Con collar o chapa",
      onRemove: () => updateFilter({ hasCollar: false }),
    });
  if (filters.sortBy !== "recientes")
    chips.push({
      key: "sort",
      label: `Orden: ${SORT_LABELS[filters.sortBy]}`,
      onRemove: () => updateFilter({ sortBy: "recientes" }),
    });

  return (
    <main>
      <div className="page-title listing-hero">
        <div className="container">
          <span className="adopt-eyebrow listing-hero-eyebrow">
            <PawPrint size={15} aria-hidden /> Reuní mascotas con su familia
          </span>
          <h1>Mascotas perdidas</h1>
          <p>
            {loading ? (
              "Explorá las publicaciones y ayudá a reunirlas con su familia."
            ) : (
              <>
                <strong>{pets.length}</strong>{" "}
                {pets.length === 1 ? "mascota busca" : "mascotas buscan"} volver a
                casa. Explorá y ayudá a reunirlas.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="container listing-layout">
        <aside
          className={`listing-sidebar${filtersOpen ? " open" : ""}`}
          aria-label="Filtros"
        >
          <div className="sidebar-header">
            <h3>
              <SlidersHorizontal size={17} aria-hidden /> Filtros
            </h3>
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
                className={`sidebar-type${filters.type === f.value ? " active" : ""}`}
                onClick={() => updateFilter({ type: f.value })}
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
            <div className="filter-input-wrap">
              <Search size={15} aria-hidden />
              <input
                id="listing-search"
                className="input"
                type="search"
                placeholder="Nombre, descripción…"
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
              />
            </div>
          </div>

          <div className="sidebar-block">
            <label className="sidebar-label" htmlFor="listing-location">
              Ubicación
            </label>
            <div className="filter-input-wrap">
              <MapPin size={15} aria-hidden />
              <input
                id="listing-location"
                className="input"
                type="text"
                placeholder="Barrio o ciudad"
                value={filters.location}
                onChange={(e) => updateFilter({ location: e.target.value })}
              />
            </div>
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Fecha del reporte</span>
            <div className="filter-pills">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-pill${filters.dateFilter === opt.value ? " is-on" : ""}`}
                  aria-pressed={filters.dateFilter === opt.value}
                  onClick={() => updateFilter({ dateFilter: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Tamaño</span>
            <div className="filter-pills">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-pill${filters.sizes.includes(opt.value) ? " is-on" : ""}`}
                  aria-pressed={filters.sizes.includes(opt.value)}
                  onClick={() =>
                    updateFilter({
                      sizes: toggleInArray(filters.sizes, opt.value),
                    })
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Edad aproximada</span>
            <div className="filter-pills">
              {AGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-pill${filters.ages.includes(opt.value) ? " is-on" : ""}`}
                  aria-pressed={filters.ages.includes(opt.value)}
                  onClick={() =>
                    updateFilter({
                      ages: toggleInArray(filters.ages, opt.value),
                    })
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <span className="sidebar-label">Sexo</span>
            <div className="filter-seg" role="group" aria-label="Sexo">
              {SEX_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-seg-item${filters.sex === opt.value ? " is-on" : ""}`}
                  aria-pressed={filters.sex === opt.value}
                  onClick={() => updateFilter({ sex: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <label className="filter-switch">
              <input
                type="checkbox"
                checked={filters.hasCollar}
                onChange={(e) => updateFilter({ hasCollar: e.target.checked })}
              />
              <span className="filter-switch-track" aria-hidden>
                <span className="filter-switch-thumb" />
              </span>
              <span className="filter-switch-label">Con collar o chapa</span>
            </label>
          </div>

          <div className="sidebar-block">
            <label className="sidebar-label" htmlFor="listing-sort">
              Ordenar por
            </label>
            <select
              id="listing-sort"
              className="select"
              value={filters.sortBy}
              onChange={(e) =>
                updateFilter({ sortBy: e.target.value as SortBy })
              }
            >
              <option value="urgentes">Más urgentes</option>
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
            <div className="listing-view-toggle" role="group" aria-label="Vista">
              <button
                type="button"
                className={`view-btn${view === "grid" ? " is-on" : ""}`}
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={15} aria-hidden /> Grilla
              </button>
              <button
                type="button"
                className={`view-btn${view === "map" ? " is-on" : ""}`}
                aria-pressed={view === "map"}
                onClick={() => setView("map")}
              >
                <MapIcon size={15} aria-hidden /> Mapa
              </button>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm listing-filters-toggle"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              {filtersOpen ? "Ocultar filtros" : "Filtros"}
              {activeFilters > 0 && ` (${activeFilters})`}
            </button>
          </div>

          {chips.length > 0 && (
            <div className="listing-chips">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="listing-chip"
                  onClick={c.onRemove}
                  aria-label={`Quitar filtro ${c.label}`}
                >
                  {c.label}
                  <X size={13} aria-hidden />
                </button>
              ))}
              <button
                type="button"
                className="listing-chip listing-chip-clear"
                onClick={clearFilters}
              >
                Limpiar todo
              </button>
            </div>
          )}

          {loading ? (
            <CatLoader label="CARGANDO" />
          ) : filtered.length === 0 ? (
            <div className="listing-empty">
              <span className="listing-empty-icon" aria-hidden>
                <Search size={32} />
              </span>
              <p>No hay mascotas que coincidan con tu búsqueda.</p>
              <div className="listing-empty-actions">
                {activeFilters > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </button>
                )}
                <Link
                  href="/mascotas-perdidas/reportar"
                  className="btn btn-primary"
                >
                  Reportar una mascota
                </Link>
              </div>
            </div>
          ) : view === "map" ? (
            <PetsMap pets={filtered} />
          ) : (
            <>
              <ul className="pet-grid listing-grid">
                {petsPerPages &&
                  petsPerPages.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      showReportStatus={pet.reportStatus !== "activo"}
                    />
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
