import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Carga next.config + .env en el entorno de test.
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Los specs de Playwright viven en e2e/ y no deben correr con Jest.
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/e2e/"],
  moduleNameMapper: {
    // Alias del proyecto (tsconfig: "@/*" -> "./*").
    "^@/(.*)$": "<rootDir>/$1",
    // axios v1 expone ESM por defecto; usamos su build CJS para Jest.
    "^axios$": "<rootDir>/node_modules/axios/dist/node/axios.cjs",
  },
  // Coverage acotado a la capa unit-testeable (lógica pura, redux, wrappers de
  // servicio y componentes presentacionales). Páginas, secciones de admin,
  // mapas y servicios de red se cubren por E2E (Playwright) o quedan fuera de
  // alcance del unit testing, así que no se miden acá.
  collectCoverageFrom: [
    "validation/**/*.{ts,tsx}",
    "lib/auth-signature.ts",
    "lib/admin/**/*.{ts,tsx}",
    "redux/{hooks.ts,reducers.tsx}",
    "services/{request.ts,user.admin.tsx}",
    "components/admin/lib/**/*.{ts,tsx}",
    "components/admin/sections/mensajes/**/*.{ts,tsx}",
    "components/messages/**/*.{ts,tsx}",
    "components/utils/{helpers,FormikHelper}.tsx",
    "components/{brand,pet-card,form-stepper}.tsx",
    "!**/*.d.ts",
  ],
};

// next/jest se exporta asi para poder cargar la config (async) de Next.
export default createJestConfig(config);
