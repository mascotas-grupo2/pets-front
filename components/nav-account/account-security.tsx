"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeEmail, changePassword, deleteAccount } from "@/services/auth.login";
import { useUserContext } from "@/context/UserContext";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import handleToast from "@/components/utils/toast";

export default function AccountSecurity() {
  const router = useRouter();
  const { logout } = useUserContext();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const [deletePass, setDeletePass] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  async function onChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const res = await changeEmail(newEmail.trim(), emailPass);
    setSavingEmail(false);
    if (res.ok) {
      handleToast("success", "Email actualizado. Revisá tu casilla para verificar la nueva dirección.");
      setNewEmail("");
      setEmailPass("");
    } else {
      handleToast("error", res.error ?? "No se pudo cambiar el email.");
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      handleToast("error", "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      handleToast("error", "Las contraseñas nuevas no coinciden.");
      return;
    }
    setSavingPass(true);
    const res = await changePassword(current, next);
    setSavingPass(false);
    if (res.ok) {
      handleToast("success", "Contraseña actualizada. Volvé a iniciar sesión.");
      await logout();
      router.push("/login");
    } else {
      handleToast("error", res.error ?? "No se pudo cambiar la contraseña.");
    }
  }

  async function onConfirmDelete() {
    setDeleting(true);
    const res = await deleteAccount(deletePass || undefined);
    setDeleting(false);
    if (res.ok) {
      handleToast("success", "Tu cuenta fue eliminada.");
      await logout();
      router.push("/");
    } else {
      handleToast("error", res.error ?? "No se pudo eliminar la cuenta.");
      setConfirmDelete(false);
    }
  }

  return (
    <div className="account-security">
      <div className="section-title" style={{ textAlign: "left", margin: "2.5rem 0 1.5rem" }}>
        <h2>Seguridad</h2>
        <p style={{ marginLeft: 0 }}>Cambiá tu contraseña o dá de baja tu cuenta.</p>
      </div>

      <form onSubmit={onChangeEmail} className="account-settings-form">
        <h3 style={{ margin: "0 0 1rem" }}>Cambiar email</h3>
        <div className="form-grid">
          <div className="field">
            <label>Nuevo email</label>
            <input
              className="input"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nuevo@email.com"
            />
          </div>
          <div className="field">
            <label>Contraseña actual</label>
            <input
              className="input"
              type="password"
              value={emailPass}
              onChange={(e) => setEmailPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b7280)", margin: "0 0 0.75rem" }}>
          Vas a tener que verificar la nueva dirección por correo.
        </p>
        <div className="wizard-nav" style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-outline" disabled={savingEmail}>
            {savingEmail ? "Guardando…" : "Cambiar email"}
          </button>
        </div>
      </form>

      <form onSubmit={onChangePassword} className="account-settings-form">
        <h3 style={{ margin: "1.5rem 0 1rem" }}>Cambiar contraseña</h3>
        <div className="field">
          <label>Contraseña actual</label>
          <input
            className="input"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Nueva contraseña</label>
            <input
              className="input"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="field">
            <label>Repetir nueva contraseña</label>
            <input
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="wizard-nav" style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary" disabled={savingPass}>
            {savingPass ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      </form>

      <div className="danger-zone">
        <h3>Eliminar cuenta</h3>
        <p>
          Esta acción es permanente: se borran tu perfil, publicaciones,
          solicitudes, mensajes y notificaciones. No se puede deshacer.
        </p>
        <div className="field" style={{ maxWidth: 320 }}>
          <label>Confirmá tu contraseña</label>
          <input
            className="input"
            type="password"
            value={deletePass}
            onChange={(e) => setDeletePass(e.target.value)}
            autoComplete="current-password"
            placeholder="Tu contraseña"
          />
        </div>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setConfirmDelete(true)}
        >
          Eliminar mi cuenta
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar cuenta"
        message="¿Seguro que querés eliminar tu cuenta? Esta acción es permanente y borra todos tus datos."
        confirmLabel="Sí, eliminar mi cuenta"
        cancelLabel="No"
        danger
        busy={deleting}
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
