"use client";

import { Search, Bell, Mail, ChevronDown } from "lucide-react";

type AdminTopbarProps = {
  title: string;
  subtitle: string;
};

export function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="admin-topbar-actions">
        <div className="admin-search">
          <Search size={16} aria-hidden />
          <input type="search" placeholder="Buscar..." aria-label="Buscar" />
        </div>

        <button type="button" className="admin-icon-btn" aria-label="Notificaciones">
          <Bell size={18} aria-hidden />
          <span className="admin-icon-badge">0</span>
        </button>

        <button type="button" className="admin-icon-btn" aria-label="Mensajes">
          <Mail size={18} aria-hidden />
          <span className="admin-icon-badge admin-icon-badge-accent">3</span>
        </button>

        <button type="button" className="admin-user-chip">
          <span className="admin-user-avatar" aria-hidden>
            AR
          </span>
          <span className="admin-user-name">Admin Refugio</span>
          <ChevronDown size={16} aria-hidden />
        </button>
      </div>
    </header>
  );
}
