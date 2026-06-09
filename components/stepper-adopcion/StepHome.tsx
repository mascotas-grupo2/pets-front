import { AdoptForm } from "@/types/adoptar";
import { useFormik } from "formik";
import { FormikHandleChange, FormikHandleError } from "../utils/FormikHelper";
import ShowError from "../utils/ShowError";

type F = ReturnType<typeof useFormik<AdoptForm>>;

const StepHome = ({ formik }: { formik: F }) => {
  return (
    <>
      <h2 className="wizard-heading">Sobre tu hogar</h2>
      <div className="form-grid">
        <div className="field full">
          <label className="field-label">¿Tenés jardín o patio? *</label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="hasGarden"
                checked={formik.values.hasGarden === "si"}
                onChange={() => formik.setFieldValue("hasGarden", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="hasGarden"
                checked={formik.values.hasGarden === "no"}
                onChange={() => formik.setFieldValue("hasGarden", "no")}
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "hasGarden")} />
        </div>

        <div className="field">
          <label className="field-label">Tipo de vivienda *</label>
          <select
            className="select"
            name="livingSituation"
            value={formik.values.livingSituation}
            onChange={(e) => FormikHandleChange(formik, "livingSituation", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="phd">PH / Duplex</option>
            <option value="quinta">Quinta</option>
            <option value="otro">Otro</option>
          </select>
          <small style={{ color: "var(--gray-500)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
            Los perros grandes requieren jardín, pero pueden adaptarse a departamentos si hay espacio.
          </small>
          <ShowError message={FormikHandleError(formik, "livingSituation")} />
        </div>

        <div className="field">
          <label className="field-label">Entorno *</label>
          <select
            className="select"
            name="householdSetting"
            value={formik.values.householdSetting}
            onChange={(e) => FormikHandleChange(formik, "householdSetting", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="urbano">Urbano</option>
            <option value="suburbano">Suburbano</option>
            <option value="rural">Rural</option>
          </select>
          <ShowError message={FormikHandleError(formik, "householdSetting")} />
        </div>

        <div className="field full">
          <label className="field-label">Nivel de actividad del hogar *</label>
          <select
            className="select"
            name="activityLevel"
            value={formik.values.activityLevel}
            onChange={(e) => FormikHandleChange(formik, "activityLevel", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="tranquilo">Tranquilo (Paseos cortos, vida calmada)</option>
            <option value="moderado">Moderado (Paseos regulares, actividad normal)</option>
            <option value="activo">Muy activo (Deportistas, salir a correr)</option>
          </select>
          <small style={{ color: "var(--gray-500)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
            Para cachorros o mascotas jóvenes sugerimos actividad moderada o alta.
          </small>
          <ShowError message={FormikHandleError(formik, "activityLevel")} />
        </div>
      </div>
    </>
  );
};

export default StepHome;
