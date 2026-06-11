import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fijamos la raíz del workspace al directorio del front. Sin esto, Next infiere
  // mal la raíz por un package-lock.json suelto en el HOME y Turbopack se cuelga
  // intentando crawlear todo el directorio personal.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
