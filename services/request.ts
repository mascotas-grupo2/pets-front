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
      error: err.message,
    };
  }
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
