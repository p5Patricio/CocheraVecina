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

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (vehicleSize) params.append("vehicle_size", vehicleSize);
    if (spaceType) params.append("space_type", spaceType);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header / Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase">Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Buscar por ciudad..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="w-[180px]">
            <label className="block text-xs font-bold text-slate-500 uppercase">Vehículo</label>
            <select
              value={vehicleSize}
              onChange={(e) => setVehicleSize(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
            >
              <option value="">Cualquier tamaño</option>
              <option value="compact">Compacto</option>
              <option value="sedan">Sedán</option>
              <option value="suv">SUV</option>
              <option value="truck">Pickup</option>
            </select>
          </div>

          <div className="w-[180px]">
            <label className="block text-xs font-bold text-slate-500 uppercase">Tipo</label>
            <select
              value={spaceType}
              onChange={(e) => setSpaceType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
            >
              <option value="">Techado o abierto</option>
              <option value="covered">Techado</option>
              <option value="uncovered">Al aire libre</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Results Count */}
      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Cocheras en {city || "México"} ({spots.length})
        </h1>
        <span className="text-xs font-medium text-slate-500">
          Estancias recomendadas: 2 a 15 días
        </span>
      </div>

      {/* Spot Grid */}
      {loading ? (
        <div className="mt-12 flex justify-center text-sm font-medium text-slate-400">
          Buscando cocheras disponibles...
        </div>
      ) : spots.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Car className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-900">No encontramos cocheras con esos filtros</h3>
          <p className="mt-1 text-sm text-slate-500">
            Intenta ampliando tu búsqueda o prueba con "León".
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition hover:shadow-lg"
            >
              {/* Photo placeholder or image */}
              <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {spot.images && spot.images.length > 0 ? (
                  <img
                    src={getMediaUrl(spot.images[0].url)}
                    alt={spot.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Car className="h-10 w-10 text-slate-300" />
                    <span className="text-xs">Foto de cochera verificada</span>
                  </div>
                )}
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    {spot.space_type === "covered" ? "Techado" : "Al aire libre"}
                  </span>
                  <span className="rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    {spot.vehicle_size.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Spot Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 line-clamp-1">{spot.title}</h3>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>4.9</span>
                  </div>
                </div>

                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {spot.city}, {spot.state}
                </p>

                <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
                  {spot.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900">
                      ${(spot.price_per_day / 100).toFixed(0)} MXN
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / día</span>
                  </div>

                  <Link
                    href={`/spots/${spot.id}`}
                    className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Ver y Reservar
                  </Link>
                </div>
              </div>
            </div>
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
