import { AdoptForm } from "@/types/adoptar";
import { useFormik } from "formik";
import { FormikHandleChange, FormikHandleError } from "../utils/FormikHelper";
import ShowError from "../utils/ShowError";

type F = ReturnType<typeof useFormik<AdoptForm>>;

const StepAnimals = ({ formik }: { formik: F }) => {
  return (
    <>
      <h2 className="wizard-heading">Otras mascotas</h2>
      <div className="form-grid">
        <div className="field full">
          <label className="field-label">
            ¿Alguien del hogar es alérgico a animales? *
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="hasAllergies"
                checked={formik.values.hasAllergies === "si"}
                onChange={() => formik.setFieldValue("hasAllergies", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="hasAllergies"
                checked={formik.values.hasAllergies === "no"}
                onChange={() => formik.setFieldValue("hasAllergies", "no")}
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "hasAllergies")} />
        </div>

        {formik.values.hasAllergies === "si" && (
          <div className="field full">
            <label className="field-label">Contanos los detalles de las alergias</label>
            <textarea
              className="textarea"
              name="allergies"
              value={formik.values.allergies}
              onChange={(e) => FormikHandleChange(formik, "allergies", e)}
              placeholder="Ej: Alergia leve a los gatos..."
            />
          </div>
        )}

        <div className="field full">
          <label className="field-label">
            ¿Hay otras mascotas en tu hogar? *
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="otherAnimals"
                checked={formik.values.otherAnimals === "si"}
                onChange={() => formik.setFieldValue("otherAnimals", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="otherAnimals"
                checked={formik.values.otherAnimals === "no"}
                onChange={() => formik.setFieldValue("otherAnimals", "no")}
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "otherAnimals")} />
        </div>

        {formik.values.otherAnimals === "si" && (
          <div className="field full">
            <label className="field-label">
              Detalle: especie, edad y género
            </label>
            <textarea
              className="textarea"
              name="otherAnimalsDetail"
              value={formik.values.otherAnimalsDetail}
              onChange={(e) =>
                FormikHandleChange(formik, "otherAnimalsDetail", e)
              }
              placeholder="Ej: perro, 4 años, macho castrado"
            />
          </div>
        )}

        <div className="field">
          <label className="field-label">¿Están castradas? *</label>
          <div className="radio-row">
            {(["si", "no", "na"] as const).map((v) => (
              <label className="radio-opt" key={v}>
                <input
                  type="radio"
                  name="neutered"
                  checked={formik.values.neutered === v}
                  onChange={() => formik.setFieldValue("neutered", v)}
                />
                {v === "si" ? "Sí" : v === "no" ? "No" : "No aplica"}
              </label>
            ))}
          </div>
          <small style={{ color: "var(--gray-500)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
            Si no lo están, el porcentaje de compatibilidad puede bajar.
          </small>
          <ShowError message={FormikHandleError(formik, "neutered")} />
        </div>

        <div className="field">
          <label className="field-label">
            ¿Están vacunadas (últimos 12 meses)? *
          </label>
          <div className="radio-row">
            {(["si", "no", "na"] as const).map((v) => (
              <label className="radio-opt" key={v}>
                <input
                  type="radio"
                  name="vaccinated"
                  checked={formik.values.vaccinated === v}
                  onChange={() => formik.setFieldValue("vaccinated", v)}
                />
                {v === "si" ? "Sí" : v === "no" ? "No" : "No aplica"}
              </label>
            ))}
          </div>
          <ShowError message={FormikHandleError(formik, "vaccinated")} />
        </div>

        <div className="field full">
          <label className="field-label">
            Contanos sobre tu experiencia previa con mascotas y el hogar que vas
            a ofrecer
          </label>
          <textarea
            className="textarea"
            name="experience"
            value={formik.values.experience}
            onChange={(e) => FormikHandleChange(formik, "experience", e)}
            placeholder="Tu historia ayuda a encontrar el match ideal"
          />
        </div>
      </div>
    </>
  );
};

export default StepAnimals;
