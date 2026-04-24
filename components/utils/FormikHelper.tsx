import { FormikProps, FormikValues } from "formik";

function get(obj: unknown, path: string): unknown {
  if (!path || typeof path !== "string") return undefined;
  return path
    .split(".")
    .reduce(
      (acc: unknown, part: string) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      obj,
    );
}

const FormikHandleError = <T extends FormikValues>(
  formik: FormikProps<T>,
  name: keyof T & string,
): string => {
  const touched = get(formik.touched, name);
  const error = get(formik.errors, name);
  return touched && typeof error === "string" ? error : "";
};

const FormikHandleChange = <T extends FormikValues>(
  formik: FormikProps<T>,
  name: keyof T & string,
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  const target = e.target as HTMLInputElement;
  if (target.type === "checkbox") {
    formik.setFieldValue(name, target.checked);
  } else {
    formik.setFieldValue(name, target.value);
  }
};

export { FormikHandleChange, FormikHandleError };
