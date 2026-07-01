"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import type { SectionProps } from "../../admin-config";
import {
  createRefugio,
  getRefugios,
  updateRefugio,
  type Refugio,
} from "@/services/refugios";

type FormState = {
  name: string;
  slug: string;
  email: string;
  phone: string;
  location: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  email: "",
  phone: "",
  location: "",
};

const FIELDS: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: "name", label: "Nombre *", placeholder: "Refugio Morón" },
  { key: "slug", label: "Slug (opcional)", placeholder: "refugio-moron" },
  { key: "email", label: "Email", placeholder: "contacto@refugio.com" },
  { key: "phone", label: "Teléfono", placeholder: "11 5555-5555" },
  { key: "location", label: "Ubicación", placeholder: "Morón, Buenos Aires" },
];

export function RefugiosSection(_props: SectionProps) {
  const role = useAppSelector((state) => state.user.role);
  const isSuperadmin = role === "superadmin";

  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getRefugios();
    if (res.ok && res.data) setRefugios(res.data);
    else toast.error("No se pudieron cargar los refugios.");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperadmin) void load();
  }, [isSuperadmin, load]);

  if (!isSuperadmin) {
    return (
      <div className="refugios-section">
        <div className="dash-panel">
          <div className="refugios-form-body">
            <p className="dash-muted">No tenés permisos para ver esta sección.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleField = (k: keyof FormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    const body = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      location: form.location.trim() || null,
    };
    const res = editingId
      ? await updateRefugio(editingId, body)
      : await createRefugio(body);
    if (res.ok) {
      toast.success(editingId ? "Refugio actualizado." : "Refugio creado.");
      resetForm();
      await load();
    } else {
      toast.error(res.error || "No se pudo guardar el refugio.");
    }
    setSaving(false);
  };

  const startEdit = (r: Refugio) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      slug: r.slug,
      email: r.email ?? "",
      phone: r.phone ?? "",
      location: r.location ?? "",
    });
  };

  const toggleActive = async (r: Refugio) => {
    const res = await updateRefugio(r.id, { active: !r.active });
    if (res.ok) {
      toast.success(r.active ? "Refugio desactivado." : "Refugio activado.");
      await load();
    } else {
      toast.error(res.error || "No se pudo cambiar el estado.");
    }
  };

  return (
    <div className="refugios-section">
      <div className="dash-panel">
        <div className="dash-panel-head">
          <h2>
            <Building2 size={16} aria-hidden className="refugios-head-icon" />
            {editingId ? "Editar refugio" : "Nuevo refugio"}
          </h2>
          {editingId && (
            <button type="button" className="dash-link" onClick={resetForm}>
              Cancelar edición
            </button>
          )}
        </div>
        <div className="refugios-form-body">
          <div className="refugios-form-grid">
            {FIELDS.map((f) => (
              <div className="vdrawer-edit-field" key={f.key}>
                <label className="vdrawer-edit-label" htmlFor={`ref-${f.key}`}>
                  {f.label}
                </label>
                <input
                  id={`ref-${f.key}`}
                  className="vdrawer-input"
                  value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => handleField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="refugios-form-foot">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Plus size={16} aria-hidden />
              {editingId ? "Guardar cambios" : "Crear refugio"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="dash-panel">
        <div className="dash-panel-head">
          <h2>Refugios</h2>
          <span className="dash-muted">
            {refugios.length} {refugios.length === 1 ? "refugio" : "refugios"}
          </span>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Email</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="dash-muted">
                    Cargando refugios…
                  </td>
                </tr>
              ) : refugios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-muted">
                    No hay refugios todavía.
                  </td>
                </tr>
              ) : (
                refugios.map((r) => (
                  <tr key={r.id}>
                    <td className="dash-strong">{r.name}</td>
                    <td className="dash-muted">{r.slug}</td>
                    <td>{r.email ?? "—"}</td>
                    <td>{r.location ?? "—"}</td>
                    <td>
                      <span
                        className={`refugio-badge${r.active ? "" : " refugio-badge--off"}`}
                      >
                        {r.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="refugios-row-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => startEdit(r)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => toggleActive(r)}
                        >
                          {r.active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
