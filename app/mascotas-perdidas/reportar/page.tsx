"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { useAppDispatch } from "@/redux/hooks";
import { reportPet } from "@/services/report.pets";
import { ReportForm } from "@/types/reportar";
import { reportValidationSchema } from "@/validation/reportar";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

export default function ReportPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      formik.setFieldValue("photo", {
        file: file,
        name: file.name,
        url: reader.result as string,
      });
    reader.readAsDataURL(file);
  }

  const formik = useFormik<ReportForm>({
    enableReinitialize: true,
    initialValues: {
      name: "",
      description: "",
      animalType: "perro",
      date: new Date().toISOString().split("T")[0] || "",
      photo: null,
      location: "",
      contactPhone: "",
      contactEmail: "",
    },
    validationSchema: reportValidationSchema,
    onSubmit: async (values) => {
      try {
        const res = await reportPet(values);
        if (res) {
          handleToast("success", "¡Publicación creada con éxito!");
          dispatch({ type: "REPORT_PET", payload: res });
          router.push("/mascotas-perdidas");
        }
      } catch (error) {
        console.error(error);
        handleToast(
          "error",
          "No se pudo crear la publicación. Intentá de nuevo.",
        );
      }
    },
  });

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Reportar mascota perdida</h1>
          <p>Completá los datos para publicarla en el listado.</p>
        </div>
      </div>

      <div className="container">
        <form className="form-card" onSubmit={formik.handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label className="field-label">Foto de la mascota *</label>
              <label className="file-drop">
                <div className="icon">📷</div>
                <div>
                  <strong>
                    {formik.values.photo?.name || "Click para subir una imagen"}
                  </strong>
                </div>
                <div className="hint">PNG, JPG hasta ~5 MB</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  //required={!formik.values.photo?.file}
                />
                <ShowError message={FormikHandleError(formik, "photo")} />
              </label>
              {formik.values.photo?.url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={formik.values.photo.url}
                  alt="Vista previa"
                  className="preview"
                />
              )}
            </div>

            <div className="field">
              <label className="field-label">Nombre (opcional)</label>
              <input
                className="input"
                type="text"
                name="name"
                value={formik.values.name}
                onChange={(e) => FormikHandleChange(formik, "name", e)}
                placeholder="Ej: Toby"
              />
              <ShowError message={FormikHandleError(formik, "name")} />
            </div>

            <div className="field">
              <label className="field-label">Tipo de animal *</label>
              <select
                className="select"
                value={formik.values.animalType}
                onChange={(e) => FormikHandleChange(formik, "animalType", e)}
                name="animalType"
                onBlur={formik.handleBlur}
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
              <ShowError message={FormikHandleError(formik, "animalType")} />
            </div>

            <div className="field full">
              <label className="field-label">Descripción *</label>
              <textarea
                className="textarea"
                value={formik.values.description}
                onChange={(e) => FormikHandleChange(formik, "description", e)}
                name="description"
                placeholder="Color, tamaño, señas particulares, comportamiento…"
              />
              <ShowError message={FormikHandleError(formik, "description")} />
            </div>

            <div className="field">
              <label className="field-label">Fecha en que se perdió *</label>
              <input
                className="input"
                type="date"
                value={formik.values.date}
                onChange={(e) => FormikHandleChange(formik, "date", e)}
                name="date"
              />
              <ShowError message={FormikHandleError(formik, "date")} />
            </div>

            <div className="field">
              <label className="field-label">Ubicación *</label>
              <input
                className="input"
                type="text"
                value={formik.values.location}
                onChange={(e) => FormikHandleChange(formik, "location", e)}
                name="location"
                placeholder="Dirección, barrio o zona"
              />
              <ShowError message={FormikHandleError(formik, "location")} />
            </div>

            <div className="field">
              <label className="field-label">Teléfono de contacto *</label>
              <input
                className="input"
                type="text"
                value={formik.values.contactPhone}
                onChange={(e) => FormikHandleChange(formik, "contactPhone", e)}
                name="contactPhone"
                placeholder="+54 11 5555-5555"
              />
              <ShowError message={FormikHandleError(formik, "contactPhone")} />
            </div>

            <div className="field">
              <label className="field-label">Email de contacto *</label>
              <input
                className="input"
                type="email"
                value={formik.values.contactEmail}
                onChange={(e) => FormikHandleChange(formik, "contactEmail", e)}
                name="contactEmail"
                placeholder="tu@email.com"
              />
              <ShowError message={FormikHandleError(formik, "contactEmail")} />
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
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
