const FormikHandleError = (formik: any, name: string) => {
  return formik.touched[name] && formik.errors[name] ? formik.errors[name] : "";
};

const FormikHandleChange = (
  formik: any,
  name: string,
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  formik.setFieldValue(name, e.target.value);
  formik.setFieldTouched(name, true);
};

export { FormikHandleError, FormikHandleChange };
