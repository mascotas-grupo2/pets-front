import { ErrorGeneric } from "@/components/utils/catchErrors";
import axiosInstance from "./axios";
import { Pet } from "@/types/pet";
import { ReportForm } from "@/types/reportar";

const axios = axiosInstance;
type ResponseAxiosGetAll = {
  ok: boolean;
  data: object | null;
  status: number;
};
export const reportPet: (
  values: ReportForm,
) => Promise<ResponseAxiosGetAll | undefined> = async (values: ReportForm) => {
  try {
    const formData = new FormData();

    // Attach files (photo can be single or array)
    const photos = Array.isArray(values.photo) ? values.photo : values.photo ? [values.photo] : [];
    photos.forEach((p) => {
      if (p?.file) formData.append("photo", p.file, p.name);
      else if (p?.url && typeof p.url === "string" && p.url.startsWith("data:")) {
        // convert data URL to blob
        const arr = p.url.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const blob = new Blob([u8arr], { type: mime });
        formData.append("photo", blob, p.name || "photo.png");
      }
    });

    // Attach other fields
    const attachIf = (key: string, val: any) => {
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) {
        val.forEach((v) => formData.append(key, String(v)));
      } else {
        formData.append(key, String(val));
      }
    };

    attachIf("name", values.name);
    attachIf("animalType", values.animalType);
    attachIf("description", values.description);
    attachIf("date", values.date);
    attachIf("location", values.location);
    attachIf("contactPhone", values.contactPhone);
    attachIf("contactEmail", values.contactEmail);
    attachIf("sex", values.sex);
    attachIf("breed", values.breed);
    attachIf("ageMonths", values.ageMonths);
    attachIf("color", values.color);
    attachIf("weightKg", values.weightKg);
    attachIf("heightCm", values.heightCm);
    attachIf("hasCollar", values.hasCollar);
    attachIf("hasTag", values.hasTag);
    attachIf("microchipped", values.microchipped);
    attachIf("vaccinated", values.vaccinated);
    attachIf("neutered", values.neutered);
    attachIf("friendlyWithKids", values.friendlyWithKids);
    attachIf("trained", values.trained);

    const response = await axios.post("pet/reportar", formData);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};
