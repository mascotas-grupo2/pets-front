import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Providers } from "@/components/Providers";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Huellitas Unidas — Mascotas perdidas",
  description:
    "Reportá y encontrá mascotas perdidas cerca tuyo. Comunidad para reunir animales con sus familias.",
};


const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("huellitas-theme");
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={inter.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}
