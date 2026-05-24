import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
