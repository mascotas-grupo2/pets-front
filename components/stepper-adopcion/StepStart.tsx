import { AdoptForm } from "@/types/adoptar";
import { useFormik } from "formik";
import { FormikHandleChange, FormikHandleError } from "../utils/FormikHelper";
import ShowError from "../utils/ShowError";

type F = ReturnType<typeof useFormik<AdoptForm>>;

const StepStart = ({ formik }: { formik: F }) => {
  return (
    <>
      <h2 className="wizard-heading">Empecemos</h2>
      <div className="wizard-intro">
        <div className="wizard-intro-avatar">🐶</div>
        <p>
          Para aplicar a <strong>adoptar una mascota</strong> necesitamos que
          completes algunos datos. Tardás unos minutos y podés volver a editar
          tu perfil más tarde.
        </p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label className="field-label">Nombre *</label>
          <input
            className="input"
            type="text"
            name="firstName"
            value={formik.values.firstName}
            onChange={(e) => FormikHandleChange(formik, "firstName", e)}
            placeholder="Ej: Samanta"
          />
          <ShowError message={FormikHandleError(formik, "firstName")} />
        </div>

        <div className="field">
          <label className="field-label">Apellido *</label>
          <input
            className="input"
            type="text"
            name="lastName"
            value={formik.values.lastName}
            onChange={(e) => FormikHandleChange(formik, "lastName", e)}
            placeholder="Ej: Smith"
          />
          <ShowError message={FormikHandleError(formik, "lastName")} />
        </div>

        <div className="field">
          <label className="field-label">Email *</label>
          <input
            className="input"
            type="email"
            name="email"
            value={formik.values.email}
            onChange={(e) => FormikHandleChange(formik, "email", e)}
            placeholder="tu@email.com"
          />
          <ShowError message={FormikHandleError(formik, "email")} />
        </div>

        <div className="field">
          <label className="field-label">Teléfono *</label>
          <input
            className="input"
            type="text"
            name="phone"
            value={formik.values.phone}
            onChange={(e) => FormikHandleChange(formik, "phone", e)}
            placeholder="+54 11 5555-5555"
          />
          <ShowError message={FormikHandleError(formik, "phone")} />
        </div>

        <div className="field full">
          <label className="field-label">Qué mascota querés adoptar *</label>
          <select
            className="select"
            name="preferredAnimal"
            value={formik.values.preferredAnimal}
            onChange={(e) => FormikHandleChange(formik, "preferredAnimal", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
          <ShowError message={FormikHandleError(formik, "preferredAnimal")} />
        </div>

        <div className="field full">
          <label className="terms">
            <input
              type="checkbox"
              name="acceptsTerms"
              checked={formik.values.acceptsTerms}
              onChange={(e) => FormikHandleChange(formik, "acceptsTerms", e)}
            />
            <span>
              Leí y acepto los términos y la{" "}
              <a href="#" className="terms-link">
                Política de privacidad
              </a>
            </span>
          </label>
          <ShowError message={FormikHandleError(formik, "acceptsTerms")} />
        </div>
      </div>
    </>
  );
};
export default StepStart;
