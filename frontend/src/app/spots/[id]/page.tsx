"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ParkingSpot, BookingQuote, getMediaUrl } from "@/lib/api";
import {
  Shield,
  ShieldCheck,
  Car,
  MapPin,
  Calendar,
  Check,
  Info,
  AlertCircle,
  ArrowLeft,
  User as UserIcon,
  Lock,
  Key,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";

export default function SpotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spotId = params.id as string;

  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm font-semibold text-slate-400">
        Cargando cochera verificada...
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Car className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">Cochera no encontrada</h2>
        <p className="mt-1 text-xs text-slate-500">Es posible que el espacio haya sido pausado por su anfitrión.</p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al buscador
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a los resultados de búsqueda
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Spot Details Column */}
        <div className="lg:col-span-2">
          {/* Main Photo (Fixed 16:10 aspect ratio) */}
          <div className="relative aspect-[16/10] w-full rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200/80 shadow-sm">
            {spot.images && spot.images.length > 0 ? (
              <img
                src={getMediaUrl(spot.images[selectedImageIndex || 0]?.url || spot.images[0].url)}
                alt={spot.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Car className="h-16 w-16 text-slate-300" />
                <span className="text-xs font-medium">Foto oficial de cochera en León</span>
              </div>
            )}

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                {spot.space_type === "covered" ? "Techado" : "Al aire libre"}
              </span>
            </div>

            <div className="absolute top-4 right-4">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                Hasta {spot.vehicle_size.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Clickable Image Thumbnails */}
          {spot.images && spot.images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {spot.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    (selectedImageIndex || 0) === idx
                      ? "border-blue-600 ring-2 ring-blue-600/30"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getMediaUrl(img.url)}
                    alt={`Foto ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title & Location */}
          <div className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <MapPin className="h-4 w-4" />
              <span>
                {spot.city}, {spot.state} — C.P. {spot.postal_code}
              </span>
            </div>

            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {spot.title}
            </h1>

            {/* Verified Host Section */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {spot.host?.avatar_url ? (
                  <img
                    src={getMediaUrl(spot.host.avatar_url)}
                    alt={spot.host.full_name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-600/20"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-lg">
                    {spot.host?.full_name ? spot.host.full_name.charAt(0) : "A"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">
                      {spot.host?.full_name || "Anfitrión verificado"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700 border border-green-200">
                      <ShieldCheck className="h-3 w-3 text-green-600" />
                      Anfitrión Verificado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Identidad y teléfono validados · Respaldo CocheraVecina
                  </p>
                </div>
              </div>
            </div>

            {/* Space Attributes Grid */}
            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Características del espacio
              </h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-center">
                  <div className="flex justify-center text-blue-600 mb-1">
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Protección</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {spot.space_type === "covered" ? "Techado privado" : "Al aire libre"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-center">
                  <div className="flex justify-center text-blue-600 mb-1">
                    <Car className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Capacidad</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Hasta {spot.vehicle_size.toUpperCase()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-center">
                  <div className="flex justify-center text-blue-600 mb-1">
                    <Key className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Acceso</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Portón coordinado
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-center">
                  <div className="flex justify-center text-blue-600 mb-1">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Estancia</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Fechas flexibles
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Descripción de la cochera
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {spot.description}
              </p>
            </div>

            {/* Access Instructions */}
            {spot.access_instructions && (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span>Instrucciones de llegada y acceso</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                  {spot.access_instructions}
                </p>
              </div>
            )}

            {/* Platform Guarantees */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Garantías de seguridad CocheraVecina
              </h2>
              <div className="mt-3 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">100% de reembolso:</strong> Cancela sin penalización hasta 24 horas antes del inicio de tu reserva.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">Pago retenido con Stripe Connect:</strong> Tu dinero no se libera al anfitrión hasta que llegas y compruebas el espacio.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">Identidad confirmada:</strong> Anfitrión cotejado con verificación de identidad oficial y teléfono verificado.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Booking & Quote Card (Stripe / Airbnb Style - DESIGN.md Section 4.4) */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  ${(spot.price_per_day / 100).toFixed(0)} MXN
                </span>
                <span className="text-xs text-slate-500 font-medium"> / día</span>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 border border-blue-200/50">
                Fechas flexibles
              </span>
            </div>

            {bookingSuccess ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" />
                <h3 className="mt-2 text-sm font-bold text-emerald-900">¡Solicitud enviada con éxito!</h3>
                <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                  El anfitrión revisará tu solicitud de estancia. Puedes seguir el avance en tu panel.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                >
                  Ir a Mis Reservas
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {/* Date Inputs */}
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-2 bg-slate-50/50">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Llegada (Check-in)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="border-l border-slate-200 pl-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Salida (Check-out)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Instant Live Quote Breakdown */}
                {quote ? (
                  <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 border border-slate-200/80 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>
                        ${(quote.daily_rate / 100).toFixed(0)} MXN × {quote.total_days}{" "}
                        {quote.total_days === 1 ? "día" : "días"}
                      </span>
                      <span className="font-semibold text-slate-900">
                        ${(quote.base_amount / 100).toFixed(0)} MXN
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Tarifa de servicio CocheraVecina (10%)</span>
                      <span className="font-semibold text-slate-900">
                        ${(quote.guest_fee_amount / 100).toFixed(0)} MXN
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200/70">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>100% reembolsable hasta 24h antes</span>
                    </div>

                    <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline text-slate-900">
                      <span className="font-bold text-sm">Total estimado</span>
                      <span className="text-xl font-extrabold text-slate-900">
                        ${(quote.total_amount / 100).toFixed(0)} MXN
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-1">
                    Selecciona fechas para calcular cotización exacta
                  </p>
                )}

                {/* Full-width Cobalt Primary Button */}
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || quoteLoading || !quote}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading
                    ? "Enviando solicitud..."
                    : quoteLoading
                    ? "Calculando cotización..."
                    : "Solicitar Reserva"}
                </button>

                <p className="text-center text-[11px] text-slate-400 leading-relaxed">
                  No se te cobrará nada hasta que el anfitrión revise y confirme tu solicitud.
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

