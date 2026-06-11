import { AxiosError, type AxiosResponse } from "axios";
import { ErrorGeneric } from "@/components/utils/catchErrors";

export type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  status: number;
  error?: string;
};

export type ApiOk<T> = { ok: true; data: T; status: number };

export async function request<T>(
  call: () => Promise<AxiosResponse<T>>,
): Promise<ApiResult<T>> {
  try {
    const response = await call();
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(error);
    const err = error as AxiosError;
    return {
      ok: false,
      data: null,
      status: err.response?.status || 500,
      // Mensaje específico del backend ({ error: "..." }) si existe; sino el genérico.
      error: extractBackendError(err) ?? err.message,
    };
  }
}

/** Extrae el mensaje legible que devuelve el backend en el body de error. */
export function extractBackendError(err: AxiosError): string | undefined {
  const data = err.response?.data as
    | { error?: unknown; message?: unknown }
    | string
    | undefined;
  if (typeof data === "string") return data || undefined;
  if (data && typeof data.error === "string") return data.error;
  if (data && typeof data.message === "string") return data.message;
  return undefined;
}

export async function requestSafe<T>(
  call: () => Promise<AxiosResponse<T>>,
): Promise<ApiOk<T> | undefined> {
  try {
    const response = await call();
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
}
