"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { AnimalType } from "@/types/pet";
import { addPet } from "@/lib/storage";

export default function ReportPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState("");
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [animalType, setAnimalType] = useState<AnimalType>("perro");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!photo) return;
    setSubmitting(true);
    addPet({
      id: crypto.randomUUID(),
      name: name || undefined,
      photo,
      description,
      animalType,
      date,
      location,
      contactPhone,
      contactEmail,
      createdAt: new Date().toISOString(),
    });
    router.push("/mascotas-perdidas");
  }

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Reportar mascota perdida</h1>
          <p>Completá los datos para publicarla en el listado.</p>
        </div>
      </div>

      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label className="field-label">Foto de la mascota *</label>
              <label className="file-drop">
                <div className="icon">📷</div>
                <div>
                  <strong>{fileName || "Click para subir una imagen"}</strong>
                </div>
                <div className="hint">PNG, JPG hasta ~5 MB</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  required={!photo}
                />
              </label>
              {photo && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photo} alt="Vista previa" className="preview" />
              )}
            </div>

            <div className="field">
              <label className="field-label">Nombre (opcional)</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Toby"
              />
            </div>

            <div className="field">
              <label className="field-label">Tipo de animal *</label>
              <select
                className="select"
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value as AnimalType)}
                required
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="field full">
              <label className="field-label">Descripción *</label>
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Color, tamaño, señas particulares, comportamiento…"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Fecha en que se perdió *</label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Ubicación *</label>
              <input
                className="input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Dirección, barrio o zona"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Teléfono de contacto *</label>
              <input
                className="input"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+54 11 5555-5555"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Email de contacto *</label>
              <input
                className="input"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/mascotas-perdidas")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !photo}
            >
              {submitting ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
