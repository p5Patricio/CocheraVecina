"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Car,
  Clock,
  ArrowRight,
} from "lucide-react";
import CitySelector from "@/components/CitySelector";

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("León");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleSize, setVehicleSize] = useState("sedan");

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
              <span>Plataforma verificada en México y El Bajío</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Estacionamiento y cocheras seguras por horas o días.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Renta cocheras privadas, pensiones o cajones seguros para tu auto, moto, camioneta o pickup. Estancias cortas o extendidas con acceso coordinado y tarifas directas del anfitrión.
            </p>
          </div>

          {/* Segmented Floating Search Bar with Generous Breathing Room */}
          <div className="mx-auto mt-10 max-w-5xl">
            <form
              onSubmit={handleSearch}
              className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 p-2 sm:p-2.5 flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80"
            >
              {/* Zone 1: Destino / Ciudad with Searchable Combobox */}
              <div className="flex-[1.4] px-5 py-3 hover:bg-slate-50/80 rounded-2xl transition-colors group">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                  Destino / Ciudad
                </label>
                <div className="mt-1">
                  <CitySelector
                    value={city}
                    onChange={setCity}
                    placeholder="Ej. León, Guanajuato"
                  />
                </div>
              </div>

              {/* Zone 2: Fecha de Llegada */}
              <div className="flex-1 px-5 py-3 hover:bg-slate-50/80 rounded-2xl transition-colors group">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                  Llegada
                </label>
                <div className="relative mt-1 flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Zone 3: Fecha de Salida */}
              <div className="flex-1 px-5 py-3 hover:bg-slate-50/80 rounded-2xl transition-colors group">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                  Salida
                </label>
                <div className="relative mt-1 flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Zone 4: Tipo de Vehículo */}
              <div className="flex-1 px-5 py-3 hover:bg-slate-50/80 rounded-2xl transition-colors group">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                  Vehículo
                </label>
                <div className="relative mt-1 flex items-center">
                  <Car className="h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0 mr-2 transition-colors pointer-events-none" />
                  <select
                    value={vehicleSize}
                    onChange={(e) => setVehicleSize(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer pr-3"
                  >
                    <option value="moto">Moto / Cuatrimoto</option>
                    <option value="compact">Auto compacto</option>
                    <option value="sedan">Sedán</option>
                    <option value="suv">Camioneta / SUV</option>
                    <option value="truck">Pickup / Grande</option>
                  </select>
                </div>
              </div>

              {/* Action Search Button */}
              <div className="p-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all shrink-0"
                >
                  <Search className="h-4 w-4 stroke-[2.5]" />
                  <span>Buscar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust Badges Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Por horas o por días</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <span>Motos, autos y camionetas</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Cocheras techadas, al aire libre y pensiones</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Reembolso garantizado 24h antes</span>
            </div>
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
                Encuentra tu cochera o pensión
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Ingresa tus fechas y elige si necesitas resguardo por horas o por días. Filtra cocheras en casa, espacios al aire libre, pensiones o estacionamientos particulares para tu moto, auto compacto, sedán o camioneta.
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
                Deja tu vehículo protegido
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Llega al domicilio verificado, guarda tu moto, auto o camioneta con acceso coordinado y viaja con total tranquilidad sabiendo que tu patrimonio está resguardado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Brand Showcase & Trust Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50 py-20 sm:py-28">
        {/* Decorative background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Official Bi-tone Logo in Large Format */}
          <div className="mx-auto max-w-xs sm:max-w-sm mb-8">
            <img
              src="/logo.png"
              alt="CocheraVecina - Logo Oficial"
              className="h-36 sm:h-44 w-auto object-contain mx-auto drop-shadow-sm transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm mb-4">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Identidad y Confianza Comprobada</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl max-w-3xl mx-auto">
            El arco protector que cuida tu patrimonio mientras viajas.
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-slate-600">
            El símbolo de CocheraVecina une la silueta vehicular con un arco de resguardo continuo: protección dedicada para todo tipo de vehículos —motos, cuatrimotos, autos y camionetas— bajo el amparo de cocheras privadas, pensiones y lotes seguros con anfitriones verificados.
          </p>

          {/* 3 Pillars of the Brand Symbol */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 border border-blue-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Arco de Resguardo</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Protección integral para motos, autos y camionetas en cocheras techadas, al aire libre o pensiones privadas contra el clima y riesgos de la vía pública.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 border border-blue-100">
                <Car className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Confianza Vecinal</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Anfitriones locales con identidad validada por documentos oficiales y domicilio real. Trato humano, directo y transparente.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Paz Mental en tu Viaje</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Sin maniobras masivas ni riesgos de estacionamientos abiertos. Sabes exactamente dónde descansa tu vehículo hasta tu regreso.
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
                ¿Tienes una cochera, pensión o espacio disponible?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Monetiza cualquier espacio: cochera en casa, espacio al aire libre, pensión vehicular o estacionamiento particular. Recibe motos, autos o camionetas por horas o por días con tus propias tarifas y cobros directos vía Stripe Connect.
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
