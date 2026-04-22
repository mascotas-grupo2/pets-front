# Huellitas Unidas — Documentación del Frontend

Plataforma comunitaria para reportar y encontrar mascotas perdidas. Este documento describe la arquitectura, estructura y convenciones del frontend.

---

## 1. Resumen del proyecto

| Campo | Valor |
|---|---|
| Nombre | Huellitas Unidas |
| Paquete | `pets-front` |
| Versión | `0.1.0` |
| Stack | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| Idioma de UI | Español (`<html lang="es">`) |
| Propósito | Reportar y buscar mascotas perdidas, conectando a la comunidad con las familias |

> ⚠️ Este proyecto usa **Next.js 16.2.3**, que introduce cambios respecto de versiones anteriores. Al tocar APIs del framework, consultar `node_modules/next/dist/docs/` antes de escribir código.

---

## 2. Instalación y scripts

### Requisitos

- Node.js 20+ recomendado
- npm (bloqueado con `package-lock.json`)

### Puesta en marcha

```bash
npm install
npm run dev        # Desarrollo en http://localhost:3000
```

### Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción (requiere `build` previo) |
| `npm run lint` | ESLint sobre el proyecto |

### Variables de entorno

| Variable | Default | Uso |
|---|---|---|
| `BACKEND_URL` | `http://localhost:3001/api` | URL base del backend al que redirige el proxy `/api/proxy/*` |

---

## 3. Dependencias principales

### Runtime

- **next** `16.2.3` — framework (App Router)
- **react** / **react-dom** `19.2.4`
- **@reduxjs/toolkit** `^2.11.2` + **react-redux** `^9.2.0` + **redux** `^5.0.1` — estado global
- **axios** `^1.15.0` — cliente HTTP (apuntado al proxy interno)
- **formik** `^2.4.9` — manejo de formularios
- **yup** `^1.7.1` — schemas de validación
- **sonner** `^2.0.7` — toasts de notificación

### Desarrollo

- **typescript** `^5` (modo estricto)
- **eslint** `^9` + **eslint-config-next** `16.2.3`
- **@types/node** `^20`, **@types/react** `^19`, **@types/react-dom** `^19`

---

## 4. Estructura de carpetas

```
pets-front/
├── app/                          # Rutas y layouts (App Router)
│   ├── layout.tsx                # Layout raíz con Providers
│   ├── page.tsx                  # Landing
│   ├── globals.css               # Estilos globales
│   ├── not-found.tsx             # 404
│   ├── api/proxy/[...path]/      # Proxy al backend
│   ├── login/, registro/         # Auth
│   ├── mascotas-perdidas/        # Listado + /reportar
│   ├── account/                  # Panel de usuario
│   ├── about/, care-guides/, faq/
├── components/                   # Componentes reutilizables
│   └── utils/                    # Helpers de UI (Formik, toast, errores)
├── redux/                        # Store, reducers y hooks tipados
├── services/                     # Cliente axios y llamadas al backend
├── validation/                   # Schemas Yup por formulario
├── types/                        # Tipos TS compartidos
├── lib/                          # Utilidades (storage local, seed)
├── public/                       # Assets estáticos (imágenes, svg)
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## 5. Rutas (App Router)

| Ruta | Archivo | Propósito | Acceso |
|---|---|---|---|
| `/` | [app/page.tsx](app/page.tsx) | Landing con hero, listado de mascotas, guías, testimonios | Público |
| `/login` | [app/login/page.tsx](app/login/page.tsx) | Inicio de sesión | Público |
| `/registro` | [app/registro/page.tsx](app/registro/page.tsx) | Registro de usuario | Público |
| `/mascotas-perdidas` | [app/mascotas-perdidas/page.tsx](app/mascotas-perdidas/page.tsx) | Listado con búsqueda y filtros por tipo | Público |
| `/mascotas-perdidas/reportar` | [app/mascotas-perdidas/reportar/page.tsx](app/mascotas-perdidas/reportar/page.tsx) | Formulario para reportar mascota | Público |
| `/account` | [app/account/page.tsx](app/account/page.tsx) | Perfil y reportes del usuario | Requiere sesión |
| `/about` | [app/about/page.tsx](app/about/page.tsx) | Información institucional | Público |
| `/care-guides` | [app/care-guides/page.tsx](app/care-guides/page.tsx) | Guías de cuidado | Público |
| `/faq` | [app/faq/page.tsx](app/faq/page.tsx) | Preguntas frecuentes | Público |
| `/api/proxy/[...path]` | [app/api/proxy/[...path]/route.ts](app/api/proxy/[...path]/route.ts) | Proxy HTTP hacia el backend | Interno |
| `*` | [app/not-found.tsx](app/not-found.tsx) | Página 404 | Público |

### Metadata (desde `layout.tsx`)

- **Title:** `Huellitas Unidas — Mascotas perdidas`
- **Description:** `Reportá y encontrá mascotas perdidas cerca tuyo. Comunidad para reunir animales con sus familias.`
- **Fuente:** Inter (Google Fonts) expuesta vía variable CSS `--font-inter`

---

## 6. Componentes

### Layout

- [components/site-header.tsx](components/site-header.tsx) — Navbar con links de navegación, botón *Reportar* y CTA condicional (*Ingresar* / *Mi Cuenta*) según sesión en Redux.
- [components/site-footer.tsx](components/site-footer.tsx) — Footer con ayuda, contacto, newsletter y redes.
- [components/brand.tsx](components/brand.tsx) — Logo y marca (🐾 Huellitas Unidas).
- [components/Providers.tsx](components/Providers.tsx) — Wrapper de `Provider` de Redux + `Toaster` de Sonner (`position="bottom-right"`, `richColors`).

### Feature

- [components/pet-card.tsx](components/pet-card.tsx) — Tarjeta de mascota perdida (foto, nombre/tipo, descripción, ubicación, fecha, contacto).

### Utilidades de UI (`components/utils/`)

- [FormikHelper.tsx](components/utils/FormikHelper.tsx) — `FormikHandleChange` marca el campo como tocado; `FormikHandleError` muestra el error sólo si `touched`.
- [ShowError.tsx](components/utils/ShowError.tsx) — Render simple del mensaje de error.
- [toast.tsx](components/utils/toast.tsx) — Wrapper sobre Sonner (`success`, `error`, `warning`, 3s por defecto).

---

## 7. Estado global (Redux Toolkit)

### Store — [redux/store.tsx](redux/store.tsx)

Configurado con `configureStore` de Redux Toolkit. `serializableCheck: false` para permitir objetos `File` en el estado (foto al reportar).

```ts
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Reducer raíz — [redux/reducers.tsx](redux/reducers.tsx)

Forma del estado:

```ts
{
  user: UserData | null,
  report_pet?: Pet
}
```

Acciones:

| Tipo | Payload | Uso |
|---|---|---|
| `SET_USER` | `UserData` | Se despacha al hacer login/registro |
| `REPORT_PET` | `Pet` | Se despacha tras reportar una mascota |

### Hooks tipados — [redux/hooks.ts](redux/hooks.ts)

```ts
const dispatch = useAppDispatch();
const user = useAppSelector(s => s.user);
```

---

## 8. Servicios y capa HTTP

### Cliente Axios — [services/axios.tsx](services/axios.tsx)

```ts
baseURL: "/api/proxy"
headers: { "Content-Type": "application/json" }
```

Toda llamada desde el browser pasa por el proxy interno; nunca se invoca al backend directamente desde el cliente.

### Proxy — [app/api/proxy/[...path]/route.ts](app/api/proxy/[...path]/route.ts)

- Handlers para `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
- Reenvía `/api/proxy/<path>` → `${BACKEND_URL}/<path>`.
- Preserva `Content-Type` y usa `ArrayBuffer` para soportar cargas binarias (fotos).
- Errores se devuelven como `500` con mensaje serializado.

### Servicios

| Archivo | Endpoint | Descripción |
|---|---|---|
| [services/service.login.tsx](services/service.login.tsx) | `POST /auth/login` | Login (email, password) |
| [services/service.register.tsx](services/service.register.tsx) | `POST /auth/register` | Registro (name, email, password) |
| [services/report.pets.tsx](services/report.pets.tsx) | `POST /pet/reportar` | Envía `FormData` con foto + datos |

---

## 9. Validación (Yup)

Ubicada en `validation/`. Cada schema corresponde a un formulario.

### [validation/login.tsx](validation/login.tsx)

- `email` — requerido, formato válido
- `password` — requerido, mínimo 8 caracteres, con mayúscula, minúscula y dígito

### [validation/register.tsx](validation/register.tsx)

- `name` — requerido, mínimo 2 caracteres
- `email` — requerido, formato válido
- `password` — mismas reglas que login
- `confirmPassword` — requerido, igual a `password`

### [validation/reportar.tsx](validation/reportar.tsx)

- `description` — requerido, mínimo 10 caracteres
- `animalType` — `perro` | `gato` | `otro`
- `date`, `location` — requeridos
- `contactPhone` — requerido, acepta dígitos, `+` y `-`
- `contactEmail` — requerido, email válido
- `photo` — requerido (objeto `{ file, url, name }`)

---

## 10. Tipos TypeScript

### [types/pet.ts](types/pet.ts)

```ts
type AnimalType = "perro" | "gato" | "otro"

type Pet = {
  id: string
  name?: string
  photo: string
  description: string
  animalType: AnimalType
  date: string
  location: string
  contactPhone: string
  contactEmail: string
  createdAt: string
}
```

### Tipos de formularios

- [types/login.ts](types/login.ts) — `{ email, password }`
- [types/register.ts](types/register.ts) — `{ name, email, password, confirmPassword }`
- [types/reportar.ts](types/reportar.ts) — incluye `photo: { file: File, url: string, name: string } | null`

---

## 11. Utilidades (`lib/`)

### [lib/storage.ts](lib/storage.ts)

Wrapper sobre `localStorage` bajo la clave `pets-lost` con esquema versionado (se autorregenera al cambiar la versión).

```ts
getPets(): Pet[]       // lee + fallback a seed
addPet(pet: Pet): void // prepend y persiste
resetPets(): void      // limpia storage
```

### [lib/seed.ts](lib/seed.ts)

Datos iniciales de demo (Toby — labrador, Luna — siamés) para poblar la UI sin backend.

---

## 12. Estilos

- Único archivo: [app/globals.css](app/globals.css) (~1.5k líneas).
- Basado en **CSS custom properties** + clases utilitarias por componente (`.btn`, `.input`, `.field`, `.pet-card`, `.hero`, `.auth-card`, `.account-layout`, `.faq-item`, etc.).
- Mobile-first; variantes de botón (`primary`, `outline`, `ghost`, `sm`, `lg`).
- No se usa Tailwind ni CSS modules.

---

## 13. Configuración

### [tsconfig.json](tsconfig.json)

- `strict: true`, `noEmit: true`
- `target: ES2017`
- `moduleResolution: bundler`
- Alias `@/*` → `./*`

### [next.config.ts](next.config.ts)

Vacío por ahora; preparado para agregar `images`, `redirects`, i18n, etc.

### [eslint.config.mjs](eslint.config.mjs)

Extiende `next/core-web-vitals` + `next/typescript`. Ignora `.next`, `out`, `build`, `next-env.d.ts`.

---

## 14. Flujo de datos típico

Reporte de mascota (caso representativo):

1. Usuario abre `/mascotas-perdidas/reportar`.
2. Formik inicializa valores y se engancha al schema Yup de `validation/reportar.tsx`.
3. `FormikHandleChange` actualiza valores; `FormikHandleError` muestra errores cuando el campo es `touched`.
4. En submit, `services/report.pets.tsx` envía `FormData` a `/api/proxy/pet/reportar`.
5. El proxy reenvía al backend según `BACKEND_URL`.
6. Respuesta exitosa → `dispatch({ type: "REPORT_PET", payload })` + toast de éxito + redirect.
7. Error → toast de error, el usuario corrige y reintenta.

El login/registro sigue el mismo patrón contra `/auth/*`, despachando `SET_USER`.

---

## 15. Convenciones de código

- Componentes de página/formulario → `"use client"` al tope del archivo.
- Formularios siempre con **Formik + Yup + helpers de `components/utils/`**.
- HTTP → **axios desde `services/`**, nunca `fetch` directo desde componentes.
- Rutas internas → `next/link`; navegación imperativa → `useRouter` de `next/navigation`.
- Toasts de feedback → `components/utils/toast.tsx` (evitar `alert`).
- Tipos compartidos viven en `types/`; no duplicar en cada archivo.

---

## 16. Assets públicos

`public/images/` contiene:

- Hero y landing: `hero.svg`, `hero.jpg`
- Auth: `auth-dog.png`, `auth-cat.png`
- Muestras: `pet-dog.jpg`, `pet-cat.jpg`
- Avatares: `avatar-1.jpg` … `avatar-5.jpg`
- Guías: `guide-1.jpg` … `guide-6.jpg`
- Nosotros: `about.jpg`
- `Figma/` con mockups de diseño

Además: `favicon.ico`, vectores base (`file.svg`, `globe.svg`, `window.svg`).

---

## 17. Árbol de renderizado

```
RootLayout (app/layout.tsx)
└── Providers (Redux + Toaster)
    ├── SiteHeader
    ├── <Page de la ruta>
    └── SiteFooter
```
