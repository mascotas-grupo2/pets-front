"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, Loader2 } from "lucide-react";
import { getAdminUsers } from "@/services/user.admin";
import { getContactableAdmins } from "@/services/user.info";
import type { userMessage } from "@/services/messages.services";
import { initials } from "./messages.data";

type Recipient = {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  role: string;
};

type Props = {
  /** Para no permitir abrir una conversación con uno mismo. */
  currentUserId?: number;
  /** "all" (admin: cualquier persona) | "admins" (usuario común: solo el refugio). */
  mode?: "all" | "admins";
  onSelect: (user: userMessage) => void;
  onClose: () => void;
};

/** Modal para elegir destinatario e iniciar una conversación. */
export function NuevoMensaje({ currentUserId, mode = "all", onSelect, onClose }: Props) {
  const adminsMode = mode === "admins";
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  // Búsqueda con un pequeño debounce. En modo "admins" el listado es chico y se
  // filtra del lado del cliente (el endpoint no recibe search).
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    const t = setTimeout(async () => {
      if (adminsMode) {
        const res = await getContactableAdmins();
        if (!cancel) {
          setUsers(res.ok && res.data ? res.data : []);
          setLoading(false);
        }
      } else {
        const res = await getAdminUsers({ search: q.trim() || undefined, pageSize: 20 });
        if (!cancel) {
          setUsers(res.ok && res.data ? res.data.items : []);
          setLoading(false);
        }
      }
    }, 250);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [q, adminsMode]);

  const needle = q.trim().toLowerCase();
  const visibles = users
    .filter((u) => u.id !== currentUserId)
    .filter(
      (u) =>
        !adminsMode ||
        !needle ||
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle),
    );

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="confirm-dialog nuevo-mensaje"
        role="dialog"
        aria-modal="true"
        aria-label="Nuevo mensaje"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-head">
          <h2>Nuevo mensaje</h2>
          <button type="button" className="vdrawer-close" aria-label="Cerrar" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="confirm-dialog-body">
          <div className="admin-search">
            <Search size={16} aria-hidden />
            <input
              type="search"
              placeholder="Buscar persona por nombre o email…"
              aria-label="Buscar destinatario"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          <ul className="nm-list">
            {loading ? (
              <li className="nm-empty">
                <Loader2 className="animate-spin" size={18} />
              </li>
            ) : visibles.length === 0 ? (
              <li className="nm-empty">No se encontraron personas.</li>
            ) : (
              visibles.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    className="nm-item"
                    onClick={() =>
                      onSelect({ id: u.id, name: u.name, photo: u.photo ?? "" })
                    }
                  >
                    {u.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.photo} alt={u.name} className="msg-avatar msg-avatar-sm object-cover" />
                    ) : (
                      <span className="msg-avatar msg-avatar-sm" aria-hidden>
                        {initials(u.name)}
                      </span>
                    )}
                    <span className="nm-item-body">
                      <span className="nm-item-name">{u.name}</span>
                      <span className="nm-item-sub">{u.email}</span>
                    </span>
                    <span className={`nm-role nm-role--${u.role}`}>
                      {u.role === "admin" ? "Admin" : "Usuario"}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
