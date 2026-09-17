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
        <footer className="border-t border-slate-200/80 bg-white py-10 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo-mark-192.png" alt="CocheraVecina" className="h-6 w-6 object-contain" />
              <span className="font-extrabold text-slate-900 text-sm">
                Cochera<span className="text-blue-600">Vecina</span>
              </span>
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 border border-blue-200/50">
                MX
              </span>
            </div>
            <p className="max-w-md text-slate-600 leading-relaxed">
              La alternativa confiable a los estacionamientos caros de aeropuertos y centrales de autobús.
              Renta cocheras techadas de 2 a 15 días con anfitriones verificados.
            </p>
            <p className="mt-4 text-slate-400">
              © {new Date().getFullYear()} CocheraVecina. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
