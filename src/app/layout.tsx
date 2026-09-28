import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nosso Apê 🏠 | Gestão Financeira, Aportes e Enxoval do Casal",
  description: "Aplicação web completa para casal organizar aportes, caixinhas, reforma, compras e rotina do apartamento.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nosso Apê",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-50">
      <body className="h-full flex flex-col antialiased text-slate-900 bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}