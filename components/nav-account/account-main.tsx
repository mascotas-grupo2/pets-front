import React, { useRef, useState } from "react";
import { convertLocalMonthYear } from "../utils/helpers";
import { PetCard } from "../pet-card";
import { UserDetails } from "@/types/user-details";
import { Pet } from "@/types/pet";
import { putUserDetails } from "@/services/user.info";
import handleToast from "../utils/toast";
import { ErrorGeneric } from "../utils/catchErrors";

interface ProfileViewProps {
  userDetails: UserDetails;
  activeReports: number;
  pets: Pet[];
}

export default function ProfileView({
  userDetails,
  activeReports,
  pets,
}: ProfileViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePhotoClick = () => {
    if (!isUpdating) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación básica de tamaño (ej: 2MB)
    if (file.size > 2 * 1024 * 1024) {
      handleToast("error", "La imagen es muy pesada (máximo 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setIsUpdating(true);

      try {
        // Enviamos todos los datos actuales pero pisamos la foto
        const res = await putUserDetails({
          ...userDetails,
          photo: base64String,
        });

        if (res && res.ok) {
          handleToast("success", "Foto de perfil actualizada");
          // Recargamos para que el contexto de usuario y la vista tomen los nuevos datos
          window.location.reload();
        } else {
          handleToast("error", "No se pudo actualizar la foto");
        }
      } catch (error) {
        ErrorGeneric(error);
      } finally {
        setIsUpdating(false);
      }
    };
    reader.readAsDataURL(file);
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
              src={userDetails.photo || "/images/avatar-placeholder.svg"}
              alt="Foto de perfil"
              style={{
                opacity: isUpdating ? 0.5 : 1,
                transition: "all 0.3s ease",
              }}
            />
            {!isUpdating && (
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
