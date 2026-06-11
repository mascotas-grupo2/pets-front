"use client";

import { UserDetails } from "@/types/user-details";
import React from "react";
import { useFormik } from "formik";
import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import { validationSchemaUpdateUserDetails } from "@/validation/update-user";
import { putUserDetails } from "@/services/user.info";
import { useDispatch } from "react-redux";
import handleToast from "../utils/toast";
import { ErrorGeneric } from "../utils/catchErrors";
import { useAppSelector } from "@/redux/hooks"; // Importamos useAppSelector

interface AccountSettingsFormProps {
  userDetails: UserDetails;
}

export default function AccountSettingsForm({
  userDetails,
}: AccountSettingsFormProps) {
  const dispatch = useDispatch();
  const { adopter } = useAppSelector((state) => state.user);
  const formik = useFormik({
    initialValues: {
      ...userDetails,
      addressLine1: userDetails.addressLine1 || "",
      addressLine2: userDetails.addressLine2 || "",
      phone: userDetails.phone || "",
      postcode: userDetails.postcode || "",
      town: userDetails.town || "",
      livingSituation: userDetails.livingSituation || "",
      householdSetting: userDetails.householdSetting || "",
      activityLevel: userDetails.activityLevel || "",
      allergies: userDetails.allergies || "",
      otherAnimalsDetail: userDetails.otherAnimalsDetail || "",
    },
    validationSchema: validationSchemaUpdateUserDetails,
    onSubmit: async (values) => {
      try {
        const res = await putUserDetails(values);
        if (!res) return;
        if (res.ok) {
          dispatch({ type: "user/setFormAdoption", payload: res.data });
          handleToast("success", "¡Solicitud enviada con éxito!");
        } else {
          handleToast(
            "error",
            `Error (${res.status}): No se pudo enviar la solicitud.`,
          );
        }
      } catch (error) {
        ErrorGeneric(error);
      }
    },
  });

  return (
    <div className="account-settings-form">
      <div
        className="section-title"
        style={{ textAlign: "left", marginBottom: "2rem" }}
      >
        <h2>Configuración de Perfil</h2>
        <p style={{ marginLeft: "0" }}>
          Actualizá tu información personal y preferencias de hogar.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Nombre</label>
            <input
              className="input"
              type="text"
              name="firstName"
              value={formik.values.firstName}
              onChange={(e) => FormikHandleChange(formik, "firstName", e)}
            />
            <ShowError message={FormikHandleError(formik, "firstName")} />
          </div>
          <div className="field">
            <label>Apellido</label>
            <input
              name="lastName"
              value={formik.values.lastName}
              onChange={(e) => FormikHandleChange(formik, "lastName", e)}
              className="input"
            />
            <ShowError message={FormikHandleError(formik, "lastName")} />
          </div>
        </div>

        <div className="field">
          <label>Email (No editable)</label>
          <input value={formik.values.email} className="input" disabled />
        </div>

        <div className="field">
          <label>Teléfono</label>
          <input
            name="phone"
            value={formik.values.phone}
            onChange={(e) => FormikHandleChange(formik, "phone", e)}
            className="input"
            placeholder="+54..."
          />
          <ShowError message={FormikHandleError(formik, "phone")} />
        </div>

        <h3 style={{ margin: "1.5rem 0 1rem" }}>Ubicación</h3>
        <div className="field">
          <label>Dirección Línea 1</label>
          <input
            name="addressLine1"
            value={formik.values.addressLine1}
            onChange={(e) => FormikHandleChange(formik, "addressLine1", e)}
            className="input"
          />
          <ShowError message={FormikHandleError(formik, "addressLine1")} />
        </div>
        <div className="field">
          <label>Dirección Línea 2</label>
          <input
            name="addressLine2"
            value={formik.values.addressLine2}
            onChange={(e) => FormikHandleChange(formik, "addressLine2", e)}
            className="input"
          />
          <ShowError message={FormikHandleError(formik, "addressLine2")} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Ciudad</label>
            <input
              name="town"
              value={formik.values.town}
              onChange={(e) => FormikHandleChange(formik, "town", e)}
              className="input"
            />
            <ShowError message={FormikHandleError(formik, "town")} />
          </div>
          {adopter && (
            <div className="field">
              <label>Código Postal</label>
              <input
                name="postcode"
                value={formik.values.postcode}
                onChange={(e) => FormikHandleChange(formik, "postcode", e)}
                className="input"
              />
              <ShowError message={FormikHandleError(formik, "postcode")} />
            </div>
          )}
        </div>
        {adopter && (
          <React.Fragment>
            <h3 style={{ margin: "1.5rem 0 1rem" }}>Hogar y Convivencia</h3>
            <div className="form-grid">
              <div className="field">
                <label>Situación habitacional</label>
                <select
                  name="livingSituation"
                  value={formik.values.livingSituation}
                  onChange={(e) =>
                    FormikHandleChange(formik, "livingSituation", e)
                  }
                  className="input"
                >
                  <option value="">Seleccionar…</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="phd">PH / Duplex</option>
                  <option value="quinta">Quinta</option>
                  <option value="otro">Otro</option>
                </select>
                <ShowError
                  message={FormikHandleError(formik, "livingSituation")}
                />
              </div>
              <div className="field">
                <label>¿Tiene Jardín?</label>
                <select
                  name="hasGarden"
                  className="input"
                  value={formik.values.hasGarden ? "true" : "false"}
                  onChange={(e) =>
                    formik.setFieldValue("hasGarden", e.target.value === "true")
                  }
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Adultos en el hogar</label>
                <input
                  type="number"
                  name="adults"
                  value={formik.values.adults?.toString()}
                  onChange={(e) => FormikHandleChange(formik, "adults", e)}
                  className="input"
                />
                <ShowError message={FormikHandleError(formik, "adults")} />
              </div>
              <div className="field">
                <label>Niños en el hogar</label>
                <input
                  type="number"
                  name="children"
                  value={formik.values.children?.toString()}
                  onChange={(e) => FormikHandleChange(formik, "children", e)}
                  className="input"
                />
                <ShowError message={FormikHandleError(formik, "children")} />
              </div>
            </div>

            <div className="field">
              <label>¿Hay alergias en la familia?</label>
              <input
                name="allergies"
                value={formik.values.allergies?.toString()}
                onChange={(e) => FormikHandleChange(formik, "allergies", e)}
                className="input"
                placeholder="Ninguna / Describir..."
              />
              <ShowError message={FormikHandleError(formik, "allergies")} />
            </div>

            <div className="field">
              <label>Detalle de otras mascotas</label>
              <textarea
                name="otherAnimalsDetail"
                value={formik.values.otherAnimalsDetail?.toString()}
                onChange={(e) =>
                  FormikHandleChange(formik, "otherAnimalsDetail", e)
                }
                className="input"
                style={{ minHeight: "80px", paddingTop: "0.5rem" }}
              />
            </div>

            <div className="form-grid">
              <div className="field">
                <label>¿Mascotas castradas?</label>
                <select
                  className="input"
                  value={formik.values.neutered ? "true" : "false"}
                  onChange={(e) =>
                    formik.setFieldValue("neutered", e.target.value === "true")
                  }
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
                <ShowError message={FormikHandleError(formik, "neutered")} />
              </div>
              <div className="field">
                <label>¿Mascotas vacunadas?</label>
                <select
                  className="input"
                  value={formik.values.vaccinated ? "true" : "false"}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "vaccinated",
                      e.target.value === "true",
                    )
                  }
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
                <ShowError message={FormikHandleError(formik, "vaccinated")} />
              </div>
            </div>
          </React.Fragment>
        )}

        <div
          className="wizard-nav"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting}
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
