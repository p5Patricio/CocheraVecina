"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, ParkingSpot, getMediaUrl } from "@/lib/api";
import { Shield, Car, MapPin, CheckCircle, Search, Calendar, Star } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(searchParams.get("city") || "León");
  const [vehicleSize, setVehicleSize] = useState(searchParams.get("vehicle_size") || "");
  const [spaceType, setSpaceType] = useState(searchParams.get("space_type") || "");

  const updateFilters = (newCity: string, newVehicle: string, newSpace: string) => {
    const params = new URLSearchParams();
    if (newCity) params.append("city", newCity);
    if (newVehicle) params.append("vehicle_size", newVehicle);
    if (newSpace) params.append("space_type", newSpace);
    router.push(`/search?${params.toString()}`);
  };

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const data = await api.spots.search({
        city: city || undefined,
        vehicle_size: vehicleSize || undefined,
        space_type: spaceType || undefined,
      });
      setSpots(data);
    } catch (err) {
      console.error("Error fetching spots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, [searchParams]);

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(city, vehicleSize, spaceType);
  };

  const handleVehiclePillClick = (val: string) => {
    setVehicleSize(val);
    updateFilters(city, val, spaceType);
  };

  const handleSpaceTypePillClick = (val: string) => {
    setSpaceType(val);
    updateFilters(city, vehicleSize, val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Refined Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <form onSubmit={handleCitySubmit} className="flex flex-col gap-4">
          {/* Top Row: Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-blue-600" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad o zona (ej. León, Silao, Guanajuato)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </button>
          </div>

          {/* Bottom Row: Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-100">
            {/* Vehicle Size Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">
                Vehículo:
              </span>
              {[
                { label: "Todos", value: "" },
                { label: "Compacto", value: "compact" },
                { label: "Sedán", value: "sedan" },
                { label: "SUV", value: "suv" },
                { label: "Pickup", value: "truck" },
              ].map((opt) => {
                const isActive = vehicleSize === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleVehiclePillClick(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Space Type Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">
                Espacio:
              </span>
              {[
                { label: "Cualquiera", value: "" },
                { label: "Techado", value: "covered" },
                { label: "Al aire libre", value: "uncovered" },
              ].map((opt) => {
                const isActive = spaceType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSpaceTypePillClick(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cocheras disponibles en {city || "México"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mostrando {spots.length} {spots.length === 1 ? "espacio seguro" : "espacios seguros"} disponibles
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Shield className="h-3.5 w-3.5" />
          Cancelación 100% reembolsable 24h antes
        </span>
      </div>

      {/* Spot Grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4">
              <div className="aspect-[16/10] w-full rounded-xl bg-slate-200" />
              <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : spots.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Car className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-900">
            No encontramos cocheras con esos filtros en {city}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Prueba seleccionando "Todos" los tamaños de vehículo o busca en "León".
          </p>
          <button
            onClick={() => {
              setVehicleSize("");
              setSpaceType("");
              updateFilters(city, "", "");
            }}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <Link
              key={spot.id}
              href={`/spots/${spot.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Photo: Fixed Aspect Ratio 16:10 with WebP & Subtle Zoom */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                {spot.images && spot.images.length > 0 ? (
                  <img
                    src={getMediaUrl(spot.images[0].url)}
                    alt={spot.title}
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Car className="h-10 w-10 text-slate-300" />
                    <span className="text-xs font-medium">Cochera verificada</span>
                  </div>
                )}

                {/* Floating Backdrop-Blur Badges (DESIGN.md Section 4.3) */}
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

              {/* Spot Body */}
              <div className="flex flex-1 flex-col p-5">
                {/* Location & Rating */}
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {spot.city}, {spot.state}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span className="text-slate-700">4.9</span>
                  </div>
                </div>

                {/* Spot Title */}
                <h3 className="mt-1.5 font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {spot.title}
                </h3>

                {/* Spot Description */}
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {spot.description}
                </p>

                {/* Host Info Row */}
                <div className="mt-3 flex items-center gap-2">
                  {spot.host?.avatar_url ? (
                    <img
                      src={getMediaUrl(spot.host.avatar_url)}
                      alt={spot.host.full_name}
                      className="h-5 w-5 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      {spot.host?.full_name ? spot.host.full_name.charAt(0) : "V"}
                    </div>
                  )}
                  <span className="text-xs text-slate-600">
                    Anfitrión: <span className="font-semibold text-slate-800">{spot.host?.full_name?.split(" ")[0] || "Vecino"}</span>
                  </span>
                </div>

                {/* Price & Action */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900">
                      ${(spot.price_per_day / 100).toFixed(0)} MXN
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / día</span>
                  </div>

                  <span className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-blue-700">
                    Ver cochera
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Cargando buscador...</div>}>
      <SearchContent />
    </Suspense>
  );
}
