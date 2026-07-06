"use client";

import { LocationPicker } from "@/components/location-picker";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import handleToast from "@/components/utils/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getIdPets,
  updatePet,
  updatePetPhotos,
} from "@/services/mascotas.pets";
import { Pet, PetSex, PetStatus } from "@/types/pet";
import { PET_STATUS_LABELS } from "@/components/admin/lib/pet-status";
import {
  Camera,
  ClipboardList,
  Heart,
  ImagePlus,
  MapPin,
  PawPrint,
  Phone,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type NewPhoto = { file: File; url: string };

const STATUS_OPTIONS: PetStatus[] = [
  "perdido",
  "en tránsito",
  "en tratamiento médico",
  "en adopción",
  "adoptado",
];

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const CHECKS: { key: keyof FormState; label: string; icon: string }[] = [
  { key: "hasCollar", label: "Tiene collar", icon: "🦮" },
  { key: "hasTag", label: "Tiene chapita", icon: "🏷️" },
  { key: "microchipped", label: "Tiene microchip", icon: "💾" },
  { key: "vaccinated", label: "Vacunado/a", icon: "💉" },
  { key: "neutered", label: "Castrado/a", icon: "✂️" },
  { key: "friendlyWithKids", label: "Se lleva bien con chicos", icon: "🧒" },
  { key: "trained", label: "Entrenado/a", icon: "🎓" },
];

type FormState = {
  name: string;
  status: PetStatus;
  description: string;
  date: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  sex: PetSex | "";
  breed: string;
  ageMonths: string;
  color: string;
  weightKg: string;
  heightCm: string;
  hasCollar: boolean;
  hasTag: boolean;
  microchipped: boolean;
  vaccinated: boolean;
  neutered: boolean;
  friendlyWithKids: boolean;
  trained: boolean;
};

function petToForm(pet: Pet): FormState {
  return {
    name: pet.name ?? "",
    status: pet.status,
    description: pet.description ?? "",
    date: pet.date ?? "",
    location: pet.location ?? "",
    contactPhone: pet.contactPhone ?? "",
    contactEmail: pet.contactEmail ?? "",
    sex: pet.sex ?? "",
    breed: pet.breed ?? "",
    ageMonths: pet.ageMonths != null ? String(pet.ageMonths) : "",
    color: pet.color ?? "",
    weightKg: pet.weightKg != null ? String(pet.weightKg) : "",
    heightCm: pet.heightCm != null ? String(pet.heightCm) : "",
    hasCollar: !!pet.hasCollar,
    hasTag: !!pet.hasTag,
    microchipped: !!pet.microchipped,
    vaccinated: !!pet.vaccinated,
    neutered: !!pet.neutered,
    friendlyWithKids: !!pet.friendlyWithKids,
    trained: !!pet.trained,
  };
}

export default function EditPetPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [pet, setPet] = useState<Pet | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fotos: las que ya tiene la mascota (se pueden quitar) + las nuevas a subir.
  const [originalPhotos, setOriginalPhotos] = useState<string[]>([]);
  const [keepPhotos, setKeepPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    getIdPets(id)
      .then((res) => {
        if (ignore) return;
        if (res && res.ok && res.data) {
          setPet(res.data);
          const formData = petToForm(res.data);
          setForm(formData);
          setInitialForm(formData);
          const photos = Array.isArray(res.data.photos)
            ? res.data.photos.filter(Boolean)
            : res.data.photo
              ? [res.data.photo]
              : [];
          setOriginalPhotos(photos);
          setKeepPhotos(photos);
        }
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      newPhotos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const uploads = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNewPhotos((prev) => [...prev, ...uploads]);
    e.target.value = "";
  }

  function removeExistingPhoto(url: string) {
    setKeepPhotos((prev) => prev.filter((u) => u !== url));
  }

  function removeNewPhoto(idx: number) {
    setNewPhotos((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  const isOwner = useMemo(
    () => !!user.isLoggedIn && user.id != null && pet?.userId === user.id,
    [user.isLoggedIn, user.id, pet?.userId],
  );

  const isRefugioAdmin = user.isLoggedIn && user.role === "admin";

  const ADMIN_EDITABLE = useMemo(
    () =>
      new Set([
        "en tránsito",
        "en tratamiento médico",
        "en adopción",
        "adoptado",
        "devuelta al dueño",
      ]),
    [],
  );

  // Una vez que la mascota entra al circuito del refugio (verificada o en
  // proceso de adopción), la gestiona solo el refugio: el publicador ya no edita,
  // pero SÍ el admin del refugio (vacunas, peso, tratamiento…).
  const canEdit = useMemo(() => {
    if (!pet) return false;
    if (isRefugioAdmin) {
      return !!pet.status && ADMIN_EDITABLE.has(pet.status);
    }
    if (!isOwner) return false;
    if (pet.isOwner) return false;
    const REFUGIO_STATUSES = new Set([
      "en tránsito",
      "en tratamiento médico",
      "en adopción",
      "adoptado",
      "devuelta al dueño",
    ]);
    return !(pet.status && REFUGIO_STATUSES.has(pet.status));
  }, [isRefugioAdmin, ADMIN_EDITABLE, isOwner, pet]);

  // El que no puede editar (no es dueño ni admin, o ya la gestiona el refugio): al detalle.
  useEffect(() => {
    if (!loading && pet && !canEdit) {
      router.replace(`/mascotas-perdidas/${id}`);
    }
  }, [loading, pet, canEdit, id, router]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  const photosChanged =
    newPhotos.length > 0 ||
    keepPhotos.length !== originalPhotos.length ||
    keepPhotos.some((u, i) => u !== originalPhotos[i]);

  const isDirty =
    !!form &&
    !!initialForm &&
    (JSON.stringify(form) !== JSON.stringify(initialForm) || photosChanged);

  function handleCancel() {
    if (isDirty) setConfirmCancel(true);
    else router.push(`/mascotas-perdidas/${id}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const required: [keyof FormState, string][] = [
      ["description", "la descripción"],
      ["date", "la fecha"],
      ["location", "la ubicación"],
      ["contactPhone", "el teléfono de contacto"],
      ["contactEmail", "el email de contacto"],
    ];
    for (const [key, label] of required) {
      if (!String(form[key]).trim()) {
        handleToast("error", `Completá ${label}.`);
        return;
      }
    }

    if (keepPhotos.length + newPhotos.length === 0) {
      handleToast("error", "La publicación debe tener al menos una foto.");
      return;
    }

    const patch: Partial<Pet> = {
      status: form.status,
      description: form.description.trim(),
      date: form.date.trim(),
      location: form.location.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      hasCollar: form.hasCollar,
      hasTag: form.hasTag,
      microchipped: form.microchipped,
      vaccinated: form.vaccinated,
      neutered: form.neutered,
      friendlyWithKids: form.friendlyWithKids,
      trained: form.trained,
    };
    if (form.name.trim()) patch.name = form.name.trim();
    if (form.sex) patch.sex = form.sex;
    if (form.breed.trim()) patch.breed = form.breed.trim();
    if (form.color.trim()) patch.color = form.color.trim();
    if (form.ageMonths !== "") patch.ageMonths = Number(form.ageMonths);
    if (form.weightKg !== "") patch.weightKg = Number(form.weightKg);
    if (form.heightCm !== "") patch.heightCm = Number(form.heightCm);

    setSaving(true);
    const res = await updatePet(id, patch);

    if (!res.ok || !res.data) {
      setSaving(false);
      handleToast("error", "No se pudo guardar. Intentá de nuevo.");
      return;
    }

    let finalPet = res.data;
    if (photosChanged) {
      const photoRes = await updatePetPhotos(
        id,
        keepPhotos,
        newPhotos.map((p) => p.file),
      );
      if (photoRes.ok && photoRes.data) {
        finalPet = photoRes.data;
      } else {
        setSaving(false);
        handleToast(
          "error",
          "Los datos se guardaron, pero no se pudieron actualizar las fotos.",
        );
        return;
      }
    }

    setSaving(false);
    dispatch({ type: "pets/pet", payload: finalPet });
    handleToast(
      "success",
      finalPet.reportStatus === "pendiente"
        ? "Cambios guardados. Quedaron pendientes de revisión por un administrador."
        : "Publicación actualizada.",
    );
    router.push(`/mascotas-perdidas/${id}`);
  }

  if (loading) {
    return (
      <main>
        <div
          className="container"
          style={{ padding: "4rem 0", textAlign: "center" }}
        >
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  if (!pet || !form || (!isOwner && !isRefugioAdmin)) {
    return (
      <main>
        <div
          className="container"
          style={{ padding: "4rem 0", textAlign: "center" }}
        >
          <p>Redirigiendo...</p>
        </div>
      </main>
    );
  }

  const heroPhoto = keepPhotos[0] ?? newPhotos[0]?.url ?? null;

  return (
    <main>
      <div className="container edit-wrap">
        <nav className="edit-breadcrumb" aria-label="Breadcrumb">
          <Link href="/mascotas-perdidas">Mascotas perdidas</Link>
          <span aria-hidden>›</span>
          <Link href={`/mascotas-perdidas/${id}`}>{pet.name ?? "Detalle"}</Link>
          <span aria-hidden>›</span>
          <span className="is-current">Editar</span>
        </nav>

        <header className="edit-header">
          <h1>Editar publicación</h1>
          <p>
            Modificá los datos de{" "}
            {pet.name ? <strong>{pet.name}</strong> : "tu mascota publicada"} y
            guardá los cambios.
          </p>
        </header>

        <form className="edit-card" onSubmit={handleSubmit}>
          {/* Identidad de la mascota */}
          <div className="edit-card__pet">
            <div className="edit-card__avatar">
              {heroPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={heroPhoto} alt={pet.name ?? "Mascota"} />
              ) : (
                <PawPrint />
              )}
            </div>
            <div className="edit-card__id">
              <span className="edit-card__name">
                {pet.name || "Sin nombre"}
              </span>
              <span className="edit-card__chips">
                <span className="edit-chip edit-chip--accent">
                  {PET_STATUS_LABELS[form.status] ?? capitalize(form.status)}
                </span>
                {pet.reportStatus && pet.reportStatus !== "activo" && (
                  <span className="edit-chip">
                    {capitalize(pet.reportStatus)}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* ── Foto ── */}
          <section className="edit-block">
            <div className="edit-block__head">
              <h2 className="form-section__title">
                <span className="form-section__icon" aria-hidden>
                  <Camera />
                </span>
                Foto
              </h2>
              <p className="form-section__hint">
                Una buena foto ayuda a que reconozcan a la mascota.
              </p>
            </div>

            {(keepPhotos.length > 0 || newPhotos.length > 0) && (
              <div className="photo-grid">
                {keepPhotos.map((url) => (
                  <div className="photo-thumb" key={url}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Foto de la mascota" />
                    <button
                      type="button"
                      className="photo-thumb__remove"
                      aria-label="Quitar foto"
                      onClick={() => removeExistingPhoto(url)}
                    >
                      <X />
                    </button>
                  </div>
                ))}
                {newPhotos.map((p, i) => (
                  <div className="photo-thumb photo-thumb--new" key={p.url}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="Foto nueva" />
                    <span className="photo-thumb__tag">Nueva</span>
                    <button
                      type="button"
                      className="photo-thumb__remove"
                      aria-label="Quitar foto nueva"
                      onClick={() => removeNewPhoto(i)}
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              className="file-drop"
              style={{
                marginTop: keepPhotos.length || newPhotos.length ? "1rem" : 0,
              }}
            >
              <div className="icon">
                <ImagePlus size={28} />
              </div>
              <div>
                <strong>Agregar foto</strong>
              </div>
              <div className="hint">
                PNG o JPG, hasta ~5 MB cada una. Podés subir varias.
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectPhotos}
              />
            </label>
          </section>

          {/* ── Datos básicos ── */}
          <section className="edit-block">
            <div className="edit-block__head">
              <h2 className="form-section__title">
                <span className="form-section__icon" aria-hidden>
                  <ClipboardList />
                </span>
                Datos básicos
              </h2>
            </div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label">Nombre</label>
                <input
                  className="input"
                  type="text"
                  value={form.name}
                  placeholder="Ej: Toby"
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Estado *</label>
                <select
                  className="select"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as PetStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {PET_STATUS_LABELS[s] ?? capitalize(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <label className="field-label">Descripción *</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  placeholder="Color, tamaño, señas particulares, comportamiento…"
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ── Características ── */}
          <section className="edit-block">
            <div className="edit-block__head">
              <h2 className="form-section__title">
                <span className="form-section__icon" aria-hidden>
                  <PawPrint />
                </span>
                Características
              </h2>
              <p className="form-section__hint">
                Datos opcionales que ayudan a identificar a la mascota.
              </p>
            </div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label">Sexo</label>
                <div className="radio-row">
                  <label className="radio-opt">
                    <input
                      type="radio"
                      name="sex"
                      checked={form.sex === "macho"}
                      onChange={() => set("sex", "macho" as PetSex)}
                    />
                    Macho
                  </label>
                  <label className="radio-opt">
                    <input
                      type="radio"
                      name="sex"
                      checked={form.sex === "hembra"}
                      onChange={() => set("sex", "hembra" as PetSex)}
                    />
                    Hembra
                  </label>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Raza</label>
                <input
                  className="input"
                  type="text"
                  value={form.breed}
                  placeholder="Ej: Labrador, Mestizo"
                  onChange={(e) => set("breed", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Edad (meses)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.ageMonths}
                  placeholder="Ej: 24"
                  onChange={(e) => set("ageMonths", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Color</label>
                <input
                  className="input"
                  type="text"
                  value={form.color}
                  placeholder="Ej: Negro, Atigrado"
                  onChange={(e) => set("color", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Peso (kg)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.1"
                  value={form.weightKg}
                  placeholder="Ej: 12.5"
                  onChange={(e) => set("weightKg", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Altura (cm)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.1"
                  value={form.heightCm}
                  placeholder="Ej: 45"
                  onChange={(e) => set("heightCm", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ── Salud y comportamiento ── */}
          <section className="edit-block">
            <div className="edit-block__head">
              <h2 className="form-section__title">
                <span className="form-section__icon" aria-hidden>
                  <Heart />
                </span>
                Salud y comportamiento
              </h2>
              <p className="form-section__hint">
                Marcá las casillas que apliquen.
              </p>
            </div>
            <div className="checkbox-grid">
              {CHECKS.map((c) => (
                <label key={c.key} className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={form[c.key] as boolean}
                    onChange={(e) => set(c.key, e.target.checked as never)}
                  />
                  <span className="checkbox-card-icon" aria-hidden>
                    {c.icon}
                  </span>
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* ── Dónde y cuándo ── */}
          <section className="edit-block">
            <div className="edit-block__head">
              <h2 className="form-section__title">
                <span className="form-section__icon" aria-hidden>
                  <MapPin />
                </span>
                Dónde y cuándo
              </h2>
            </div>
            <div className="form-grid">
              <div className="field full">
                <label className="field-label">Fecha *</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className="field full">
                <label className="field-label">Ubicación *</label>
                <LocationPicker
                  value={form.location}
                  onChange={(v) => set("location", v)}
                />
              </div>
            </div>
          </section>

          {/* ── Contacto ── */}
          <section className="edit-block">
            <div className="edit-block__head">
              <h2 className="form-section__title">
                <span className="form-section__icon" aria-hidden>
                  <Phone />
                </span>
                Contacto
              </h2>
            </div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label">Teléfono de contacto *</label>
                <input
                  className="input"
                  type="text"
                  value={form.contactPhone}
                  placeholder="+54 11 5555-5555"
                  onChange={(e) => set("contactPhone", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Email de contacto *</label>
                <input
                  className="input"
                  type="email"
                  value={form.contactEmail}
                  placeholder="tu@email.com"
                  onChange={(e) => set("contactEmail", e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="edit-card__footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="¿Descartar cambios?"
        message="Si salís ahora se van a perder los cambios sin guardar."
        confirmLabel="Descartar cambios"
        cancelLabel="Seguir editando"
        danger
        onConfirm={() => router.push(`/mascotas-perdidas/${id}`)}
        onCancel={() => setConfirmCancel(false)}
      />
    </main>
  );
}
