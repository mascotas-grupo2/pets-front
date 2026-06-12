"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  PawPrint,
  Heart,
  Home,
  Clock,
  Save,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const ROTATING = [
  "alma gemela peluda",
  "nueva mejor amistad",
  "compañía perfecta",
  "fiel amistad de cuatro patas",
];

const PETS = [
  { emoji: "🐶", label: "perros" },
  { emoji: "🐱", label: "gatos" },
  { emoji: "🐰", label: "conejos" },
  { emoji: "🐹", label: "roedores" },
];

const STEPS = [
  {
    icon: PawPrint,
    n: "1",
    title: "Contanos de vos",
    desc: "Tu hogar, tu rutina y con quién vivís. Son unos pocos datos.",
  },
  {
    icon: Heart,
    n: "2",
    title: "Te emparejamos",
    desc: "Buscamos la mascota ideal según tu perfil y disponibilidad.",
  },
  {
    icon: Home,
    n: "3",
    title: "Se conocen",
    desc: "Coordinamos el encuentro con tu nueva mascota.",
  },
];

const CHIPS = [
  { icon: Clock, label: "~5 minutos" },
  { icon: Save, label: "Guardás tu progreso" },
  { icon: ShieldCheck, label: "Sin compromiso hasta conocerla" },
];

// Huellitas ambientales: posiciones/tiempos fijos (sin random → evita hydration mismatch).
const FLOAT_PAWS = [
  { left: "6%", delay: "0s", dur: "13s", size: 26, op: 0.1 },
  { left: "18%", delay: "4s", dur: "17s", size: 18, op: 0.08 },
  { left: "33%", delay: "8s", dur: "15s", size: 32, op: 0.07 },
  { left: "52%", delay: "2s", dur: "19s", size: 22, op: 0.09 },
  { left: "68%", delay: "6s", dur: "14s", size: 28, op: 0.08 },
  { left: "81%", delay: "10s", dur: "18s", size: 20, op: 0.1 },
  { left: "92%", delay: "1s", dur: "16s", size: 30, op: 0.07 },
];

export default function AdoptarLandingPage() {
  const [wordIdx, setWordIdx] = useState(0);
  const [pickedPet, setPickedPet] = useState<number | null>(null);
  const [bursts, setBursts] = useState<{ id: number; left: number }[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const burstId = useRef(0);

  // Palabra rotante del titular.
  useEffect(() => {
    const t = setInterval(
      () => setWordIdx((i) => (i + 1) % ROTATING.length),
      2400
    );
    return () => clearInterval(t);
  }, []);

  // Parallax sutil del hero siguiendo el mouse.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // Reveal de los pasos al entrar en viewport.
  useEffect(() => {
    const ol = stepsRef.current;
    if (!ol) return;
    const items = Array.from(ol.querySelectorAll(".adopt-step"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            (en.target as HTMLElement).classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  const pickPet = (i: number, e: React.MouseEvent) => {
    setPickedPet(i);
    const rect = (
      e.currentTarget as HTMLElement
    ).offsetParent?.getBoundingClientRect();
    const btn = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left = rect ? btn.left - rect.left + btn.width / 2 : btn.width / 2;
    const id = burstId.current++;
    setBursts((b) => [...b, { id, left }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
  };

  return (
    <main className="adopt-landing">
      {/* ---- Hero ---- */}
      <section className="adopt-hero" ref={heroRef}>
        {/* glows con parallax */}
        <span className="adopt-glow adopt-glow-1" aria-hidden />
        <span className="adopt-glow adopt-glow-2" aria-hidden />
        {/* huellitas flotando */}
        <div className="adopt-paws" aria-hidden>
          {FLOAT_PAWS.map((p, i) => (
            <span
              key={i}
              className="adopt-paw"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.dur,
                fontSize: p.size,
                opacity: p.op,
              }}
            >
              🐾
            </span>
          ))}
        </div>

        <div className="container adopt-hero-inner">
          <span className="adopt-eyebrow reveal" style={{ animationDelay: "0.05s" }}>
            <PawPrint size={15} aria-hidden /> Adopción responsable
          </span>
          <h1 className="reveal" style={{ animationDelay: "0.15s" }}>
            Encontrá a tu
            <br />
            <span className="adopt-rotator">
              <span key={wordIdx} className="adopt-hl">
                {ROTATING[wordIdx]}
              </span>
            </span>
          </h1>
          <p className="adopt-lead reveal" style={{ animationDelay: "0.28s" }}>
            Adoptar es un compromiso lindo y a largo plazo. Con unos pocos datos
            sobre tu hogar te emparejamos con la mascota ideal para vos.
          </p>
          <div className="adopt-cta reveal" style={{ animationDelay: "0.4s" }}>
            <Link href="/adoptar/solicitar" className="btn btn-primary btn-lg adopt-cta-main">
              Empezar solicitud <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/mascotas-perdidas" className="btn btn-outline btn-lg">
              Ver mascotas
            </Link>
          </div>

          {/* tira interactiva de mascotas */}
          <div className="adopt-petstrip reveal" style={{ animationDelay: "0.52s" }}>
            <div className="adopt-petstrip-row">
              {PETS.map((p, i) => (
                <button
                  key={p.label}
                  type="button"
                  className={`adopt-pet${pickedPet === i ? " is-picked" : ""}`}
                  onClick={(e) => pickPet(i, e)}
                  aria-label={`Hay ${p.label} buscando hogar`}
                >
                  <span className="adopt-pet-emoji">{p.emoji}</span>
                </button>
              ))}
              {bursts.map((b) => (
                <span
                  key={b.id}
                  className="adopt-burst"
                  style={{ left: b.left }}
                  aria-hidden
                >
                  💜
                </span>
              ))}
            </div>
            <p className="adopt-petstrip-msg" aria-live="polite">
              {pickedPet === null
                ? "Tocá una carita 👆"
                : `Hay ${PETS[pickedPet].label} esperando un hogar 💜`}
            </p>
          </div>

          <ul className="adopt-chips reveal" style={{ animationDelay: "0.64s" }}>
            {CHIPS.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.label}>
                  <Icon size={15} aria-hidden /> {c.label}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---- Cómo funciona ---- */}
      <section className="container adopt-steps-wrap">
        <h2 className="adopt-steps-title">Cómo funciona</h2>
        <ol className="adopt-steps" ref={stepsRef}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.n}
                className="adopt-step"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <span className="adopt-step-icon" aria-hidden>
                  <Icon size={22} />
                </span>
                <span className="adopt-step-n">Paso {s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
