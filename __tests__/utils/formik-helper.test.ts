import { FormikHandleChange, FormikHandleError } from "@/components/utils/FormikHelper";
import type { FormikProps } from "formik";

type Values = { email: string; acepta: boolean };

function makeFormik(over: Partial<FormikProps<Values>> = {}): FormikProps<Values> {
  return {
    values: { email: "", acepta: false },
    touched: {},
    errors: {},
    setFieldValue: jest.fn(),
    ...over,
  } as unknown as FormikProps<Values>;
}

describe("FormikHandleError", () => {
  it("devuelve '' si el campo no fue tocado", () => {
    const formik = makeFormik({ errors: { email: "Requerido" }, touched: {} });
    expect(FormikHandleError(formik, "email")).toBe("");
  });

  it("devuelve el error cuando el campo fue tocado y hay error", () => {
    const formik = makeFormik({ errors: { email: "Requerido" }, touched: { email: true } });
    expect(FormikHandleError(formik, "email")).toBe("Requerido");
  });

  it("devuelve '' si no hay error aunque esté tocado", () => {
    const formik = makeFormik({ errors: {}, touched: { email: true } });
    expect(FormikHandleError(formik, "email")).toBe("");
  });
});

describe("FormikHandleChange", () => {
  it("para un input de texto usa target.value", () => {
    const formik = makeFormik();
    const e = { target: { type: "text", value: "hola@x.com" } } as unknown as React.ChangeEvent<HTMLInputElement>;
    FormikHandleChange(formik, "email", e);
    expect(formik.setFieldValue).toHaveBeenCalledWith("email", "hola@x.com");
  });

  it("para un checkbox usa target.checked", () => {
    const formik = makeFormik();
    const e = { target: { type: "checkbox", checked: true } } as unknown as React.ChangeEvent<HTMLInputElement>;
    FormikHandleChange(formik, "acepta", e);
    expect(formik.setFieldValue).toHaveBeenCalledWith("acepta", true);
  });
});
