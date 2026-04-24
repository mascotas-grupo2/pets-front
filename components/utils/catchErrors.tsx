import { AxiosError } from "axios";
import handleToast from "./toast";

export function ErrorAxios(error: unknown) {
  console.error(error);
  const err = error as AxiosError;
  return {
    ok: false,
    data: null,
    status: err.response?.status || 500,
    error: err.message,
  };
}

export function ErrorGeneric(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  handleToast(
    "error",
    `ERROR: ${message}.\nHubo un error al enviar la solicitud. Por favor, inténtalo de nuevo.`,
  );
}
