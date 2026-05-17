import {
  uploadUserPhoto
} from "@/services/user.info";
import { Pet } from "@/types/pet";
import { UserDetails } from "@/types/user-details";
import React, { useEffect, useRef, useState } from "react";
import { PetCard } from "../pet-card";
import { ErrorGeneric } from "../utils/catchErrors";
import { convertLocalMonthYear } from "../utils/helpers";
import handleToast from "../utils/toast";

interface ProfileViewProps {
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  userDetails: UserDetails;
  activeReports: number;
  pets: Pet[];
}

export default function ProfileView({
  setUserDetails,
  userDetails,
  activeReports,
  pets,
}: ProfileViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePhotoClick = () => {
    // abrir selector solo si no estamos en proceso y no hay una vista previa activa
    if (!isUpdating && !previewUrl) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación básica de tamaño (ej: 2MB)
    if (file.size > 2 * 1024 * 1024) {
      handleToast("error", "La imagen es muy pesada (máximo 2MB)");
      return;
    }

    // Preparar vista previa y guardar selección (no subimos aún)
    const url = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleCancelSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    setIsUpdating(true);
    try {
      const res = await uploadUserPhoto(selectedFile);
      if (res && res.ok) {
        handleToast("success", "Foto de perfil actualizada");
        const updatedUserData = { ...userDetails, photo: res.data.photo };
        setUserDetails(updatedUserData);
      } else {
        handleToast("error", "No se pudo actualizar la foto");
      }
    } catch (error) {
      ErrorGeneric(error);
    } finally {
      setIsUpdating(false);
      handleCancelSelection();
    }
  };

  return (
    <>
      <div className="account-profile">
        <div className="tooltip-container">
          <div
            className={`profile-photo-container ${isUpdating ? "updating" : ""}`}
            onClick={handlePhotoClick}
            style={{ cursor: "pointer", position: "relative" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                previewUrl ??
                userDetails.photo ??
                "/images/avatar-placeholder.svg"
              }
              alt="User Photo"
              style={{
                opacity: isUpdating ? 0.5 : 1,
                transition: "all 0.3s ease",
                display: "block",
                width: "96px",
                height: "96px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />

            {!isUpdating && !previewUrl && (
              <div
                className="photo-edit-badge"
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  background: "var(--primary-500)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  color: "white",
                  fontSize: "1.2rem",
                }}
              >
                📷
              </div>
            )}

            {previewUrl && (
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  bottom: "8px",
                  display: "flex",
                  gap: "8px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  aria-label="Cancelar selección"
                  title="Cancelar"
                  onClick={handleCancelSelection}
                  disabled={isUpdating}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    cursor: isUpdating ? "not-allowed" : "pointer",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="#333"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="#333"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  aria-label="Confirmar y subir"
                  title="Confirmar y subir"
                  onClick={handleConfirmUpload}
                  disabled={isUpdating}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: isUpdating ? "rgba(34,197,94,0.6)" : "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    cursor: isUpdating ? "not-allowed" : "pointer",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {!isUpdating && (
            <div className="tooltip-content">Cambiar foto de perfil</div>
          )}
        </div>
        <div>
          <h2>
            {userDetails.firstName} {userDetails.lastName}
          </h2>
          <p>
            {userDetails.email || ""} · {userDetails.addressLine1}{" "}
            {userDetails.addressLine2 ? `, ${userDetails.addressLine2}` : ""}
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            Miembro desde {convertLocalMonthYear(userDetails.created_at)} ·{" "}
            {activeReports} publicaciones activas
          </p>
        </div>
      </div>

      <h3 style={{ marginBottom: "1rem" }}>Mis reportes recientes</h3>
      {pets.length === 0 ? (
        <p>Todavía no publicaste ninguna mascota.</p>
      ) : (
        <ul className="pet-grid">
          {pets.slice(0, 4).map((p) => (
            <PetCard key={p.id} pet={p} />
          ))}
        </ul>
      )}
    </>
  );
}
