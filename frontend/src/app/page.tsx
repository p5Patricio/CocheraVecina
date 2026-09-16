"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, Calendar, DollarSign, CheckCircle2, Car, MapPin } from "lucide-react";

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
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
              <Shield className="h-3.5 w-3.5" />
              Lanzamiento piloto en León, Guanajuato
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Tu auto protegido mientras viajas.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Renta cocheras privadas techadas de vecinos verificados para estancias de <strong>2 a 15 días</strong>. Olvídate de los estacionamientos caros y saturados de aeropuertos y terminales.
            </p>
          </div>

          {/* Search Bar Widget */}
          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ciudad o Zona
                </label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-blue-600" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. León, Guanajuato"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Llegada (Check-in)
                </label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Salida (Check-out)
                </label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vehículo
                </label>
                <div className="relative mt-1.5">
                  <Car className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    value={vehicleSize}
                    onChange={(e) => setVehicleSize(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  >
                    <option value="compact">Compacto</option>
                    <option value="sedan">Sedán</option>
                    <option value="suv">SUV / Camioneta</option>
                    <option value="truck">Pickup / Grande</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 mt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                  Buscar Cocheras Disponibles
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-y border-slate-200/80 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              ¿Por qué elegir CocheraVecina?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Diseñado pensando en la tranquilidad del viajero y la economía familiar.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Hasta 50% más barato</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Los estacionamientos comerciales de aeropuertos cobran hasta \$350 MXN por día. En CocheraVecina encuentras espacios desde \$120 MXN.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Cancelación Flexible 100%</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Si tus planes de viaje cambian, cancela hasta 24 horas antes del check-in y recibe tu reembolso total automático sin penalizaciones.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Pagos Seguros vía Stripe</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Tus fondos están resguardados con tecnología bancaria de Stripe Connect hasta que tu estancia comience satisfactoriamente.
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
              <h2 className="text-3xl font-extrabold tracking-tight">
                ¿Tienes una cochera o espacio libre en casa?
              </h2>
              <p className="mt-3 text-slate-300">
                Conviértelo en ingresos pasivos recibiendo autos de viajeros en estancias cortas. Pagos automáticos a tu cuenta bancaria vía Stripe Connect.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard?tab=host")}
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
            >
              Publicar Mi Espacio Gratis
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
