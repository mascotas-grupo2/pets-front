import { ErrorGeneric } from "@/components/utils/catchErrors";
import { User } from "@/types/user";
import axiosInstance from "./axios"; // Assuming this is configured to send cookies
import { request } from "./request";

const axios = axiosInstance;

/** Reenvía el email de verificación. Siempre 204 (no revela si el email existe). */
export const resendVerification = (email: string) =>
  request<unknown>(() => axios.post("auth/resend-verification", { email }));

/** Cambia la contraseña del usuario logueado. El back invalida la sesión. */
export const changePassword = (currentPassword: string, newPassword: string) =>
  request<unknown>(() =>
    axios.post("auth/change-password", { currentPassword, newPassword }),
  );

/** Da de baja la cuenta del usuario logueado (con confirmación por contraseña). */
export const deleteAccount = (password?: string) =>
  request<unknown>(() =>
    axios.delete("auth/account", password ? { data: { password } } : undefined),
  );

type ResponseAxios = {
  ok: boolean;
  data: User | null;
  status: number;
};
export const login: (
  email: string,
  password: string,
) => Promise<ResponseAxios | undefined> = async (
  email: string,
  password: string,
) => {
  try {
    const response = await axios.post("auth/login", {
      email,
      password,
    });
    return { ok: true, data: response.data, status: response.status };
  } catch (error: unknown) {
    ErrorGeneric(error);
    return { ok: false, data: null, status: (error as { response?: { status: number } }).response?.status || 500 };
  }
};

type ResponseAxiosLogout = {
  ok: boolean;
  data: null;
  status: number;
};
export const logout: () => Promise<
  ResponseAxiosLogout | undefined
> = async () => {
  try {
    const response = await axios.post("auth/logout");
    return { ok: true, data: null, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};

type ResponseAxiosForgotPassword = {
  ok: boolean;
  data: null;
  status: number;
};
export const forgotPassword: (
  email: string,
) => Promise<ResponseAxiosForgotPassword | undefined> = async (
  email: string,
) => {
  try {
    const response = await axios.post("auth/forgot-password", { email });
    return { ok: true, data: null, status: response.status };
  } catch (error: unknown) {
    ErrorGeneric(error);
    return {
      ok: false,
      data: null,
      status:
        (error as { response?: { status: number } }).response?.status || 500,
    };
  }
};

type ResponseAxiosResetPassword = {
  ok: boolean;
  data: null;
  status: number;
};
export const resetPassword: (
  token: string,
  newPassword: string
) => Promise<ResponseAxiosResetPassword | undefined> = async (
  token: string,
  newPassword: string
) => {
  try {
    const response = await axios.post("auth/reset-password", {
      token,
      newPassword,
    });
    return { ok: true, data: null, status: response.status };
  } catch (error: unknown) {
    ErrorGeneric(error);
    return {
      ok: false,
      data: null,
      status:
        (error as { response?: { status: number } }).response?.status || 500,
    };
  }
};
