import axiosInstance from "./axios";
import { requestSafe } from "./request";
import { ReportForm } from "@/types/reportar";

const axios = axiosInstance;

/** Procesa un Data URL (base64) y lo convierte a Blob para el FormData */
const dataURLtoBlob = (dataUrl: string) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};

export const reportPet = (values: ReportForm) => {
  const formData = new FormData();

  (values.photos || []).forEach((p) => {
    if (p.file) {
      formData.append("photo", p.file, p.name);
    } else if (typeof p.url === "string" && p.url.startsWith("data:")) {
      formData.append("photo", dataURLtoBlob(p.url), p.name || "photo.png");
    }
  });

  Object.entries(values).forEach(([key, value]) => {
    if (key === "photos" || value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, String(v)));
    } else {
      formData.append(key, String(value));
    }
  });

  return requestSafe<object>(() => axios.post("pet/reportar", formData));
};
