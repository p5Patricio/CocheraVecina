"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Car,
  MapPin,
  Star,
  ArrowRight,
  Lock,
  ChevronRight,
} from "lucide-react";
import { api, ParkingSpot, getMediaUrl } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("León");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleSize, setVehicleSize] = useState("sedan");
  const [featuredSpots, setFeaturedSpots] = useState<ParkingSpot[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(true);

  useEffect(() => {
    api.spots
      .search({ city: "León" })
      .then((spots) => {
        setFeaturedSpots(spots.slice(0, 3));
      })
      .catch((err) => {
        console.error("Error loading featured spots:", err);
      })
      .finally(() => setLoadingSpots(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (vehicleSize) params.append("vehicle_size", vehicleSize);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 sm:py-24">
        {/* Subtle background dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Plataforma verificada en León y Bajío</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Tu auto seguro mientras viajas.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Renta cocheras privadas techadas de anfitriones verificados para estancias de{" "}
              <strong className="text-slate-900 font-semibold">2 a 15 días</strong>. Olvídate
              de tarifas infladas en estacionamientos de aeropuertos y viaja con total tranquilidad.
            </p>
          </div>

          {/* Segmented Floating Search Pill (Airbnb Style) */}
          <div className="mx-auto mt-10 max-w-4xl">
            <form
              onSubmit={handleSearch}
              className="rounded-2xl lg:rounded-full bg-white border border-slate-200/80 shadow-lg shadow-slate-900/5 p-2.5 sm:p-3 flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80"
            >
              {/* Zone 1: Destino / Ciudad */}
              <div className="flex-1 px-4 py-2.5 hover:bg-slate-50 rounded-xl lg:rounded-full transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Destino / Ciudad
                </label>
                <div className="relative mt-1 flex items-center">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. León, Guanajuato"
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Zone 2: Check-in / Salida */}
              <div className="flex-1 px-4 py-2.5 hover:bg-slate-50 rounded-xl lg:rounded-full transition-colors">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Llegada
                    </label>
                    <div className="relative mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0 mr-1.5" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Salida
                    </label>
                    <div className="relative mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0 mr-1.5" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone 3: Tipo de Vehículo */}
              <div className="px-4 py-2.5 hover:bg-slate-50 rounded-xl lg:rounded-full transition-colors lg:w-48">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Vehículo
                </label>
                <div className="relative mt-1 flex items-center">
                  <Car className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
                  <select
                    value={vehicleSize}
                    onChange={(e) => setVehicleSize(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="compact">Compacto</option>
                    <option value="sedan">Sedán</option>
                    <option value="suv">SUV / Camioneta</option>
                    <option value="truck">Pickup / Grande</option>
                  </select>
                </div>
              </div>

              {/* Search Trigger Button */}
              <div className="p-1 lg:pl-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-xl lg:rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span>Buscar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust Badges Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Reserva flexible de 2 a 15 días</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Anfitriones verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Reembolso garantizado 24h antes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spots Grid */}
      <section className="bg-slate-50/50 py-16 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Disponibilidad Inmediata
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Cocheras destacadas en León
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Espacios verificados con portón eléctrico y vigilancia para estancias de corta duración.
              </p>
            </div>
            <Link
              href="/search?city=León"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Ver todas las cocheras</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Cards Grid adhering to DESIGN.md Section 4.3 */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loadingSpots ? (
              // Loading Skeleton
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4"
                >
                  <div className="aspect-[16/10] w-full rounded-xl bg-slate-200" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-1/3 rounded bg-slate-200" />
                </div>
              ))
            ) : featuredSpots.length > 0 ? (
              featuredSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Photo Container: 16:10 fixed aspect ratio with subtle zoom */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    {spot.images && spot.images.length > 0 ? (
                      <img
                        src={getMediaUrl(spot.images[0].url)}
                        alt={spot.title}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
                        <Car className="h-10 w-10 text-slate-300" />
                        <span className="text-xs font-medium">Cochera verificada</span>
                      </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute left-3 top-3 flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {spot.space_type === "covered" ? "Techado" : "Al aire libre"}
                      </span>
                    </div>

                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        Hasta {spot.vehicle_size.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content Hierarchy */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Row 1: City + Neighborhood */}
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      <span>
                        {spot.city}, {spot.state}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span className="text-slate-700 font-bold">4.9</span>
                      </div>
                    </div>

                    {/* Row 2: Spot title (truncate 1 line) */}
                    <h3 className="mt-1.5 font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {spot.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {spot.description}
                    </p>

                    {/* Row 3: Price in Mexican Pesos */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-extrabold text-slate-900">
                          ${(spot.price_per_day / 100).toFixed(0)} MXN
                        </span>
                        <span className="text-xs font-medium text-slate-500"> / día</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Ver detalle
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Curated preview cards if database is empty
              [
                {
                  title: "Cochera techada con portón eléctrico en Jardines del Moral",
                  desc: "Espacio completamente cerrado, piso de concreto, acceso controlado 24/7. A 10 min de Plaza Mayor.",
                  price: 180,
                  type: "Techado",
                  size: "Hasta SUV",
                  zone: "León, GTO",
                },
                {
                  title: "Estacionamiento privado con cámaras cerca de Poliforum",
                  desc: "Ideal para viajeros que asisten a congresos o salen por el Aeropuerto del Bajío. Vigilancia vecinal activa.",
                  price: 150,
                  type: "Techado",
                  size: "Hasta SEDÁN",
                  zone: "León, GTO",
                },
                {
                  title: "Cochera amplia en fraccionamiento cerrado Campestre",
                  desc: "Portón automatizado, cámara de seguridad hacia el cajón y cerca electrificada. Seguridad total.",
                  price: 220,
                  type: "Techado",
                  size: "Hasta PICKUP",
                  zone: "León, GTO",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push("/search?city=León")}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    <Car className="h-12 w-12 text-slate-300 group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute left-3 top-3 flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {item.type}
                      </span>
                    </div>
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        {item.size}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      <span>{item.zone}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span className="text-slate-700 font-bold">4.9</span>
                      </div>
                    </div>
                    <h3 className="mt-1.5 font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-extrabold text-slate-900">
                          ${item.price} MXN
                        </span>
                        <span className="text-xs font-medium text-slate-500"> / día</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Reservar
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* "Cómo funciona": 3 Clean Concrete Operational Steps */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Operación Simple y Transparente
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              ¿Cómo funciona CocheraVecina?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Resuelve el resguardo de tu vehículo para tu viaje en tres pasos respaldados por tecnología y garantías.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-sm">
                1
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Encuentra tu cochera
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Ingresa las fechas de tu viaje (de 2 a 15 días) y el tipo de vehículo. Filtra espacios
                techados con portón eléctrico cerca de tu punto de partida o aeropuerto.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-sm">
                2
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Reserva y coordina acceso
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                El anfitrión aprueba tu solicitud. Tu pago se custodia de forma segura vía Stripe
                Connect con garantía de cancelación 100% hasta 24 horas antes del inicio.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-sm">
                3
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Deja tu auto protegido
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Llega al domicilio verificado, guarda tu auto bajo llave y toma tu traslado al aeropuerto.
                Viaja tranquilo sabiendo que tu patrimonio está resguardado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Host CTA Banner */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-900/60 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-700/50 mb-3">
                <Car className="h-3.5 w-3.5" />
                <span>Monetiza tu espacio sin complicaciones</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                ¿Tienes una cochera techada libre en casa?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Conviértela en ingresos recibiendo autos de viajeros en estancias de 2 a 15 días.
                Tú decides cuándo recibir autos y los cobros van directo a tu cuenta bancaria vía Stripe Connect.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard?tab=host")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors shrink-0"
            >
              <span>Publicar mi espacio gratis</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

