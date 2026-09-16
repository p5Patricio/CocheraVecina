import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CocheraVecina — Renta de cocheras seguras para viajeros en México",
  description:
    "El marketplace entre particulares para dejar tu auto seguro durante tus viajes de 2 a 15 días. Más económico y seguro que estacionamientos de aeropuertos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col justify-between antialiased`}>
        <div>
          <Navbar />
          <main>{children}</main>
        </div>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="font-semibold text-slate-700">CocheraVecina México</p>
            <p className="mt-1">
              La alternativa confiable a los estacionamientos caros de aeropuertos y centrales de autobús.
            </p>
            <p className="mt-3 text-slate-400">
              © {new Date().getFullYear()} CocheraVecina. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
