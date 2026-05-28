"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column, type TableSort } from "../../ui/data-table";
import { TablePagination } from "../../ui/table-pagination";
import { usePagination } from "../../lib/use-pagination";
import { MascotaEstadoPill } from "../../lib/pet-status";
import { formatEdad } from "../../lib/pet-format";
import { PetThumb } from "../../ui/pet-thumb";
import { MascotaDrawer } from "./mascota-drawer";
import { getAdminPets, deletePet } from "@/services/mascotas.pets";
import type { AdminPetSummary, AnimalType, PetStatus } from "@/types/pet";

type Filtro = "todas" | "refugio" | "adopcion" | "adoptados";
type EspecieFiltro = "todas" | AnimalType;

const PAGE_SIZE = 10;

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "refugio", label: "En refugio" },
  { id: "adopcion", label: "En adopción" },
  { id: "adoptados", label: "Adoptados" },
];

const ESPECIES: { id: EspecieFiltro; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "perro", label: "Perros" },
  { id: "gato", label: "Gatos" },
  { id: "otro", label: "Otros" },
];

/** ¿La mascota entra en el filtro? "refugio" = todo lo que no es adopción/adoptado. */
function inFiltro(status: PetStatus | undefined, f: Filtro) {
  if (f === "todas") return true;
  if (f === "adopcion") return status === "en adopción";
  if (f === "adoptados") return status === "adoptado";
  return status !== "en adopción" && status !== "adoptado";
}

/** Listado de mascotas del refugio. El botón "Ver" abre el drawer de detalle. */
export function MascotasSection() {
  const [pets, setPets] = useState<AdminPetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [showFiltros, setShowFiltros] = useState(false);
  const [especie, setEspecie] = useState<EspecieFiltro>("todas");
  const [sort, setSort] = useState<TableSort | null>({
    key: "name",
    dir: "asc",
  });
  const [selected, setSelected] = useState<AdminPetSummary | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await getAdminPets();
    if (res.ok && res.data) setPets(res.data);
    else toast.error("No se pudieron cargar las mascotas.");
  }

  useEffect(() => {
    getAdminPets().then((res) => {
      if (res.ok && res.data) setPets(res.data);
      else toast.error("No se pudieron cargar las mascotas.");
      setLoading(false);
    });
  }, []);

  // Cerrar el menú "…" al hacer click afuera.
  useEffect(() => {
    if (!menuId) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".pub-menu") && !t.closest(".pub-menu-trigger")) {
        setMenuId(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuId]);

  const counts = useMemo(
    () => ({
      todas: pets.length,
      refugio: pets.filter((p) => inFiltro(p.status, "refugio")).length,
      adopcion: pets.filter((p) => p.status === "en adopción").length,
      adoptados: pets.filter((p) => p.status === "adoptado").length,
    }),
    [pets],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = pets.filter((p) => {
      if (!inFiltro(p.status, filtro)) return false;
      if (especie !== "todas" && p.animalType !== especie) return false;
      if (!q) return true;
      return (
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.breed ?? "").toLowerCase().includes(q) ||
        (p.animalTypeLabel ?? p.animalType ?? "").toLowerCase().includes(q)
      );
    });
    if (sort?.key === "name") {
      filtered.sort((a, b) => {
        const c = (a.name ?? "").localeCompare(b.name ?? "", "es", {
          sensitivity: "base",
        });
        return sort.dir === "asc" ? c : -c;
      });
    }
    return filtered;
  }, [pets, query, filtro, especie, sort]);

  /** Click en encabezado ordenable: asc → desc → sin orden. */
  function toggleSort(key: string) {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  async function onDelete(pet: AdminPetSummary) {
    setMenuId(null);
    if (
      !window.confirm(
        `¿Eliminar la mascota "${pet.name ?? "sin nombre"}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setBusyId(pet.id);
    const res = await deletePet(pet.id);
    setBusyId(null);
    if (res.ok) {
      await load();
      toast.success("Mascota eliminada.");
    } else {
      toast.error("No se pudo eliminar. Probá de nuevo.");
    }
  }

  const { page, setPage, totalPages, pageItems, total, desde, hasta } =
    usePagination(visible, PAGE_SIZE);

  const columns: Column<AdminPetSummary>[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (p) => (
        <div className="dash-user">
          <PetThumb pet={p} />
          <span className="dash-user-name">{p.name ?? "Sin nombre"}</span>
        </div>
      ),
    },
    {
      key: "especie",
      label: "Especie",
      render: (p) => p.animalTypeLabel ?? p.animalType ?? "—",
    },
    { key: "raza", label: "Raza", render: (p) => p.breed ?? "—" },
    { key: "edad", label: "Edad", render: (p) => formatEdad(p.ageMonths) },
    {
      key: "estado",
      label: "Estado",
      render: (p) => (
        <MascotaEstadoPill status={p.status} label={p.statusLabel} />
      ),
    },
    {
      key: "ingreso",
      label: "Ingreso",
      tdClassName: "dash-muted",
      render: (p) => p.date,
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      tdClassName: "dash-cell-action",
      render: (p) => (
        <div className="dash-row-actions pub-actions">
          <button
            type="button"
            aria-label="Ver"
            title="Ver"
            onClick={() => setSelected(p)}
          >
            <Eye size={15} />
          </button>
          <span className="pub-menu-wrap">
            <button
              type="button"
              className="pub-menu-trigger"
              aria-label="Más acciones"
              title="Más acciones"
              disabled={busyId === p.id}
              onClick={() =>
                setMenuId((m) => (m === p.id ? null : p.id))
              }
            >
              <MoreVertical size={15} />
            </button>
            {menuId === p.id && (
              <div className="pub-menu">
                <button
                  type="button"
                  className="pub-menu-item"
                  onClick={() => {
                    setMenuId(null);
                    setSelected(p);
                  }}
                >
                  <Eye size={15} /> Ver detalle
                </button>
                <Link
                  href={`/mascotas-perdidas/${p.id}/editar`}
                  className="pub-menu-item"
                  onClick={() => setMenuId(null)}
                >
                  <Pencil size={15} /> Editar
                </Link>
                <button
                  type="button"
                  className="pub-menu-item danger"
                  onClick={() => onDelete(p)}
                >
                  <Trash2 size={15} /> Eliminar
                </button>
              </div>
            )}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="pub mascotas">
      <div className="pub-toolbar">
        <Link
          href="/mascotas-perdidas/reportar"
          className="btn btn-outline btn-sm"
        >
          <Plus size={16} aria-hidden /> Nueva mascota
        </Link>
      </div>

      <div className="mtabs" role="tablist">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            className={`mtab${filtro === f.id ? " active" : ""}`}
            onClick={() => {
              setFiltro(f.id);
              setPage(1);
            }}
          >
            {f.label} <span className="mtab-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="pub-controls">
        <div className="pub-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar mascota..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setShowFiltros((s) => !s)}
        >
          <SlidersHorizontal size={16} aria-hidden /> Filtros
        </button>
      </div>

      {showFiltros && (
        <div className="pub-filter-chips">
          {ESPECIES.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`pub-chip${especie === e.id ? " active" : ""}`}
              onClick={() => {
                setEspecie(e.id);
                setPage(1);
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={pageItems}
        rowKey={(p) => p.id}
        loading={loading}
        loadingLabel="Cargando mascotas…"
        empty="No hay mascotas para mostrar."
        sort={sort}
        onSort={toggleSort}
        wrapClassName="pub-table-wrap"
      />

      {!loading && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          desde={desde}
          hasta={hasta}
          onPage={setPage}
        />
      )}

      {selected && (
        <MascotaDrawer pet={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
