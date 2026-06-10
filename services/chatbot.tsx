import { AxiosError } from "axios";
import axiosInstance from "./axios";

const axios = axiosInstance;

export type QuickReply = {
  label: string;
  value: string;
};

export type ChatbotMessage = {
  role: "assistant" | "user";
  type: "text";
  text: string;
};

export type ChatbotResponse = {
  sessionId: string;
  messages: ChatbotMessage[];
  quickReplies?: QuickReply[];
  blocked?: { reason: string };
  debug?: unknown;
};

export type SendChatbotMessageParams = {
  sessionId?: string | null;
  message: string;
};

/**
 * Envía un mensaje al chatbot.
 * El proxy interno de Next.js (`/api/proxy`) reenvía la request al backend
 * adjuntando automáticamente el Bearer token desde la cookie `auth_token`
 * si el usuario está logueado. Si no, va anónimo.
 */
export const sendChatbotMessage = async (
  params: SendChatbotMessageParams,
): Promise<{
  ok: boolean;
  data: ChatbotResponse | null;
  error?: string;
}> => {
  try {
    const { data } = await axios.post<ChatbotResponse>(
      "/chatbot/message",
      {
        sessionId: params.sessionId ?? undefined,
        message: params.message,
      },
    );
    return { ok: true, data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    const status = axiosError.response?.status;
    const serverMessage =
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message;

    if (status === 429) {
      return {
        ok: false,
        data: null,
        error: "Estás enviando mensajes demasiado rápido. Esperá unos segundos.",
      };
    }
    return {
      ok: false,
      data: null,
      error: serverMessage || "No se pudo enviar el mensaje",
    };
  }
};
