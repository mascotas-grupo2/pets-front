import { toast } from "sonner";

const handleToast = (
  type: "success" | "error" | "warning",
  message: string,
) => {
  const toastOptions = {
    duration: 3000,
  };
  const toastFunction = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
  };
  toastFunction[type](message, toastOptions);
  return;
};

export default handleToast;
