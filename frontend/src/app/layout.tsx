import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cocheravecina.patodev.com"),
  title: "CocheraVecina — Renta de cocheras y pensión en México",
  description:
    "Renta cocheras privadas, pensiones y cajones seguros por hora o día en México. Espacios techados y al aire libre para autos, motos y camionetas.",
  applicationName: "CocheraVecina",
  authors: [{ name: "Symmetrical Code" }],
  generator: "Next.js",
  keywords: [
    "renta de cocheras",
    "donde dejar mi carro",
    "estacionamiento por dia",
    "pension de autos",
    "pension para motos",
    "estacionamiento leon guanajuato",
    "aeropuerto del bajio estacionamiento",
    "cocheras privadas mexico",
    "renta de estacionamiento por hora",
    "pension nocturna para carros",
  ],
  alternates: {
    canonical: "https://cocheravecina.patodev.com",
  },
  openGraph: {
    title: "CocheraVecina — Renta de cocheras y pensión en México",
    description:
      "Renta cocheras privadas, pensiones y cajones seguros por hora o día en México. Espacios techados y al aire libre para autos, motos y camionetas.",
    url: "https://cocheravecina.patodev.com",
    siteName: "CocheraVecina",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CocheraVecina — Renta de cocheras y pensión segura en México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CocheraVecina — Renta de cocheras y pensión en México",
    description:
      "Renta cocheras privadas, pensiones y cajones seguros por hora o día en México. Para autos, motos y camionetas.",
    site: "@cocheravecina",
    creator: "@cocheravecina",
    images: ["/twitter-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://cocheravecina.patodev.com/#website",
      "url": "https://cocheravecina.patodev.com",
      "name": "CocheraVecina",
      "description": "Marketplace de renta de cocheras y estacionamiento seguro en México",
      "inLanguage": "es-MX",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://cocheravecina.patodev.com/search?city={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://cocheravecina.patodev.com/#organization",
      "name": "CocheraVecina",
      "url": "https://cocheravecina.patodev.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cocheravecina.patodev.com/logo.png",
      },
      "parentOrganization": {
        "@type": "Organization",
        "name": "Symmetrical Code",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://cocheravecina.patodev.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Dónde puedo dejar mi carro o moto seguro mientras viajo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "En CocheraVecina puedes rentar cocheras techadas, espacios al aire libre y pensiones particulares verificadas cerca de aeropuertos, centrales y zonas céntricas por horas o por días con tarifas directas del anfitrión.",
          },
        },
        {
          "@type": "Question",
          "name": "¿Se puede rentar una cochera por horas o solo por días?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Puedes rentar tanto por horas como por días completos o estancias extendidas, dependiendo de la disponibilidad configurada por cada anfitrión.",
          },
        },
        {
          "@type": "Question",
          "name": "¿Qué vehículos se pueden guardar en una cochera de CocheraVecina?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Se aceptan motocicletas, cuatrimotos, autos compactos, sedanes, camionetas SUV y pickups, filtrando en la plataforma según la capacidad específica de cada cochera.",
          },
        },
        {
          "@type": "Question",
          "name": "¿Cómo funciona la garantía de reembolso en CocheraVecina?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Todas las reservas cuentan con garantía de reembolso del 100% si cancelas con al menos 24 horas de anticipación a la fecha y hora de inicio de la estancia.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
              La alternativa confiable y económica para dejar tu vehículo seguro en México.
              Renta cocheras, pensiones y cajones con anfitriones verificados por horas o días.
            </p>
            <p className="mt-4 text-slate-400">
              © {new Date().getFullYear()} CocheraVecina (Symmetrical Code). Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
