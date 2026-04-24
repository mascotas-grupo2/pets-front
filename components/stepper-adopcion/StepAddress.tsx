import { AdoptForm } from "@/types/adoptar";
import { useFormik } from "formik";
import { FormikHandleChange, FormikHandleError } from "../utils/FormikHelper";
import ShowError from "../utils/ShowError";

type F = ReturnType<typeof useFormik<AdoptForm>>;

const StepAddress = ({ formik }: { formik: F }) => {
  return (
    <>
      <h2 className="wizard-heading">Tu dirección</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Estos datos son necesarios para poder aplicar a una adopción. Podés
        buscar tu dirección en Google Maps y completamos el resto.
      </p>

      <div className="form-grid">
        <div className="field full">
          <label className="field-label">Dirección (línea 1) *</label>
          <input
            className="input"
            type="text"
            name="addressLine1"
            value={formik.values.addressLine1}
            onChange={(e) => FormikHandleChange(formik, "addressLine1", e)}
            placeholder="Calle y número"
          />
          <ShowError message={FormikHandleError(formik, "addressLine1")} />
        </div>

        <div className="field">
          <label className="field-label">Dirección (línea 2)</label>
          <input
            className="input"
            type="text"
            name="addressLine2"
            value={formik.values.addressLine2}
            onChange={(e) => FormikHandleChange(formik, "addressLine2", e)}
            placeholder="Piso, dpto, referencia"
          />
        </div>

        <div className="field">
          <label className="field-label">Código postal *</label>
          <input
            className="input"
            type="text"
            name="postcode"
            value={formik.values.postcode}
            onChange={(e) => FormikHandleChange(formik, "postcode", e)}
            placeholder="Ej: 1425"
          />
          <ShowError message={FormikHandleError(formik, "postcode")} />
        </div>

        <div className="field full">
          <label className="field-label">Ciudad *</label>
          <input
            className="input"
            type="text"
            name="town"
            value={formik.values.town}
            onChange={(e) => FormikHandleChange(formik, "town", e)}
            placeholder="Ej: CABA"
          />
          <ShowError message={FormikHandleError(formik, "town")} />
        </div>
      </div>
    </>
  );
};

export default StepAddress;
