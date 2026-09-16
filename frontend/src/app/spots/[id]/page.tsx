"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ParkingSpot, BookingQuote } from "@/lib/api";
import { Shield, Car, MapPin, Calendar, Check, Info, AlertCircle, ArrowLeft } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";

export default function SpotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spotId = params.id as string;

  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (spotId) {
      api.spots
        .get(spotId)
        .then(setSpot)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [spotId]);

  // Recalculate quote whenever dates change
  useEffect(() => {
    if (spotId && startDate && endDate) {
      if (new Date(endDate) > new Date(startDate)) {
        setQuoteLoading(true);
        api.spots
          .getQuote(spotId, startDate, endDate)
          .then((res) => {
            setQuote(res);
            setError(null);
          })
          .catch((err) => {
            setQuote(null);
            setError(err.message);
          })
          .finally(() => setQuoteLoading(false));
      } else {
        setQuote(null);
      }
    }
  }, [spotId, startDate, endDate]);

  const handleBooking = async () => {
    const token = localStorage.getItem("cochera_token");
    if (!token) {
      setIsAuthOpen(true);
      return;
    }

    if (!startDate || !endDate) {
      setError("Selecciona las fechas de tu estancia");
      return;
    }

    setBookingLoading(true);
    setError(null);
    try {
      await api.bookings.create(token, spotId, startDate, endDate);
      setBookingSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al solicitar la reserva");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Cargando cochera...</div>;
  }

  if (!spot) {
    return (
      <div className="p-12 text-center">
        <p className="text-base font-bold text-slate-900">Cochera no encontrada</p>
        <Link href="/search" className="mt-2 inline-block text-sm text-blue-600 underline">
          Volver al buscador
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/search" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver a los resultados
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Spot Details Column */}
        <div className="lg:col-span-2">
          {/* Main Photo */}
          <div className="relative h-72 sm:h-96 w-full rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {spot.images && spot.images.length > 0 ? (
              <img src={spot.images[0].url} alt={spot.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Car className="h-16 w-16 text-slate-300" />
                <span className="text-xs font-medium">Foto oficial de cochera en León</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="rounded-lg bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                {spot.space_type === "covered" ? "Techado" : "Al aire libre"}
              </span>
              <span className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                Hasta {spot.vehicle_size.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <MapPin className="h-4 w-4" />
              {spot.city}, {spot.state} — {spot.postal_code}
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {spot.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Anfitrión: <span className="font-semibold text-slate-800">{spot.host?.full_name || "Vecino verificado"}</span>
            </p>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Descripción del espacio
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {spot.description}
              </p>
            </div>

            {spot.access_instructions && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase">Instrucciones de acceso</h3>
                <p className="mt-1 text-xs text-slate-600">{spot.access_instructions}</p>
              </div>
            )}

            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Garantías CocheraVecina
              </h2>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Cancelación flexible con 100% de reembolso hasta 24h antes del inicio.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Pago retenido de forma segura con Stripe Connect hasta confirmar tu llegada.
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Identidad y teléfono verificado del anfitrión.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reservation Widget Column */}
        <div>
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  ${(spot.price_per_day / 100).toFixed(0)} MXN
                </span>
                <span className="text-xs text-slate-500 font-medium"> / día</span>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-center">
                <Shield className="mx-auto h-8 w-8 text-green-600" />
                <h3 className="mt-2 text-sm font-bold text-green-800">¡Solicitud enviada!</h3>
                <p className="mt-1 text-xs text-green-700">
                  El anfitrión revisará tu solicitud. Podrás ver el estado en tu panel.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 w-full rounded-lg bg-green-600 py-2 text-xs font-bold text-white hover:bg-green-700"
                >
                  Ir a Mis Reservas
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Check-in</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Check-out</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Price Breakdown */}
                {quote && (
                  <div className="rounded-xl bg-slate-50 p-4 space-y-2 border border-slate-200/60 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>
                        ${(quote.daily_rate / 100).toFixed(0)} MXN × {quote.total_days} días
                      </span>
                      <span className="font-semibold">${(quote.base_amount / 100).toFixed(0)} MXN</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        Tarifa de servicio CocheraVecina (10%)
                      </span>
                      <span className="font-semibold">${(quote.guest_fee_amount / 100).toFixed(0)} MXN</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                      <span>Total</span>
                      <span>${(quote.total_amount / 100).toFixed(0)} MXN</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || quoteLoading || !quote}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {bookingLoading ? "Enviando solicitud..." : "Solicitar Reserva"}
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  No se te cobrará nada hasta que el anfitrión apruebe tu estancia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
