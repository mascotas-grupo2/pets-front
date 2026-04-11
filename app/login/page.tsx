"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/account");
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <h1>Ingresar</h1>
        <p className="sub">Bienvenido de nuevo a Furry Friends</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg">
            Ingresar
          </button>
        </form>
        <div className="divider">
          ¿No tenés cuenta? <Link href="/login">Registrate</Link>
        </div>
      </div>
    </main>
  );
}
