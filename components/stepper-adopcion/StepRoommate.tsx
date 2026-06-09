import { AdoptForm } from "@/types/adoptar";
import { useFormik } from "formik";
import { FormikHandleError } from "../utils/FormikHelper";
import ShowError from "../utils/ShowError";

type F = ReturnType<typeof useFormik<AdoptForm>>;

const StepRoommate = ({ formik }: { formik: F }) => {
  return (
    <>
      <h2 className="wizard-heading">Convivientes</h2>
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Cantidad de adultos *</label>
          <input
            className="input"
            type="number"
            min={0}
            name="adults"
            value={formik.values.adults}
            onChange={(e) =>
              formik.setFieldValue("adults", Number(e.target.value))
            }
          />
          <small style={{ color: "var(--gray-500)", fontSize: "0.8rem" }}>
            Debe vivir al menos un adulto en el hogar
          </small>
          <ShowError message={FormikHandleError(formik, "adults")} />
        </div>

        <div className="field">
          <label className="field-label">Cantidad de niños *</label>
          <input
            className="input"
            type="number"
            min={0}
            name="children"
            value={formik.values.children}
            onChange={(e) =>
              formik.setFieldValue("children", Number(e.target.value))
            }
          />
          <ShowError message={FormikHandleError(formik, "children")} />
        </div>

        <div className="field full">
          <label className="field-label">
            ¿Reciben visitas de niños frecuentemente? *
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="visitingChildren"
                checked={formik.values.visitingChildren === "si"}
                onChange={() => formik.setFieldValue("visitingChildren", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="visitingChildren"
                checked={formik.values.visitingChildren === "no"}
                onChange={() => formik.setFieldValue("visitingChildren", "no")}
              />
              No
            </label>
          </div>
          <small style={{ color: "var(--gray-500)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
            Ciertas mascotas no son aptas para hogares con niños o donde frecuentan niños.
          </small>
          <ShowError message={FormikHandleError(formik, "visitingChildren")} />
        </div>

        <div className="field full">
          <label className="field-label">
            ¿Vivís con compañeros de piso o inquilinos? *
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="hasFlatmates"
                checked={formik.values.hasFlatmates === "si"}
                onChange={() => formik.setFieldValue("hasFlatmates", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="hasFlatmates"
                checked={formik.values.hasFlatmates === "no"}
                onChange={() => formik.setFieldValue("hasFlatmates", "no")}
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "hasFlatmates")} />
        </div>
      </div>
    </>
  );
};

export default StepRoommate;
