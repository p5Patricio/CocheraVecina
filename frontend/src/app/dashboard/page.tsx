"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, Booking, ParkingSpot, User, getMediaUrl } from "@/lib/api";
import {
  Car,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "host" ? "host" : "guest";

  const [tab, setTab] = useState<"guest" | "host">(initialTab);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Guest State
  const [guestBookings, setGuestBookings] = useState<Booking[]>([]);
  // Host State
  const [hostSpots, setHostSpots] = useState<ParkingSpot[]>([]);
  const [hostBookings, setHostBookings] = useState<Booking[]>([]);

  // New Spot Form Modal State
  const [isNewSpotOpen, setIsNewSpotOpen] = useState(false);
  const [newSpotTitle, setNewSpotTitle] = useState("");
  const [newSpotDesc, setNewSpotDesc] = useState("");
  const [newSpotAddress, setNewSpotAddress] = useState("");
  const [newSpotCity, setNewSpotCity] = useState("León");
  const [newSpotState, setNewSpotState] = useState("Guanajuato");
  const [newSpotPostalCode, setNewSpotPostalCode] = useState("37000");
  const [newSpotPrice, setNewSpotPrice] = useState("150");
  const [newSpotPricePerHour, setNewSpotPricePerHour] = useState("");
  const [newSpotSize, setNewSpotSize] = useState("sedan");
  const [newSpotType, setNewSpotType] = useState("covered");
  const [newSpotPhoto, setNewSpotPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [newSpotLoading, setNewSpotLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [spotPhotoLoading, setSpotPhotoLoading] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async (jwtToken: string) => {
    setLoading(true);
    try {
      const me = await api.auth.me(jwtToken);
      setUser(me);

      const [gBookings, hSpots, hBookings] = await Promise.all([
        api.bookings.getMyBookings(jwtToken),
        api.spots.getMySpots(jwtToken),
        api.bookings.getHostBookings(jwtToken),
      ]);

      setGuestBookings(gBookings);
      setHostSpots(hSpots);
      setHostBookings(hBookings);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("cochera_token");
    if (savedToken) {
      setToken(savedToken);
      loadData(savedToken);
    } else {
      setLoading(false);
      setIsAuthOpen(true);
    }
  }, []);

  const handleApprove = async (bookingId: string) => {
    if (!token) return;
    setActionLoading(bookingId);
    try {
      await api.bookings.updateStatus(token, bookingId, "approved");
      await loadData(token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!token) return;
    setActionLoading(bookingId);
    try {
      await api.bookings.updateStatus(token, bookingId, "rejected");
      await loadData(token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!token) return;
    const confirm = window.confirm(
      "¿Deseas cancelar esta reserva? Si estás a más de 24 horas del inicio recibirás un reembolso total."
    );
    if (!confirm) return;

    setActionLoading(bookingId);
    try {
      await api.bookings.cancel(token, bookingId, "Cancelado por el usuario");
      await loadData(token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStripeOnboard = async () => {
    if (!token) return;
    try {
      const res = await api.payments.getHostOnboardingUrl(token);
      window.location.href = res.url;
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setNewSpotLoading(true);
    try {
      const payload: any = {
        title: newSpotTitle,
        description: newSpotDesc,
        address_line: newSpotAddress,
        city: newSpotCity,
        state: newSpotState,
        country: "MX",
        postal_code: newSpotPostalCode,
        latitude: 21.1221,
        longitude: -101.6822,
        price_per_day: Math.round(parseFloat(newSpotPrice) * 100),
        vehicle_size: newSpotSize,
        space_type: newSpotType,
      };

      if (newSpotPricePerHour && !isNaN(parseFloat(newSpotPricePerHour))) {
        payload.price_per_hour = Math.round(parseFloat(newSpotPricePerHour) * 100);
      }

      const createdSpot = await api.spots.create(token, payload);

      if (newSpotPhoto && createdSpot && createdSpot.id) {
        try {
          await api.spots.uploadPhoto(token, createdSpot.id, newSpotPhoto);
        } catch (uploadErr) {
          console.error("Error subiendo foto:", uploadErr);
        }
      }

      setIsNewSpotOpen(false);
      setNewSpotPricePerHour("");
      setNewSpotPhoto(null);
      setPhotoPreview(null);
      await loadData(token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setNewSpotLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarLoading(true);
    try {
      const updatedUser = await api.auth.uploadAvatar(token, file);
      setUser(updatedUser);
    } catch (err: any) {
      alert(err.message || "Error al subir foto de perfil");
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handleSpotPhotoUpload = async (spotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setSpotPhotoLoading(spotId);
    try {
      await api.spots.uploadPhoto(token, spotId, file);
      await loadData(token);
    } catch (err: any) {
      alert(err.message || "Error al subir foto de la cochera");
    } finally {
      setSpotPhotoLoading(null);
      e.target.value = "";
    }
  };

  if (!user && !loading) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <Car className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Inicia sesión para ver tu panel</h2>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(u, t) => {
            setUser(u);
            setToken(t);
            loadData(t);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header Card (DESIGN.md Section 4.5) */}
      {user && (
        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {user.avatar_url ? (
                <img
                  src={getMediaUrl(user.avatar_url)}
                  alt={user.full_name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-600/30 shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-2 ring-blue-600/20 text-xl font-bold">
                  {user.full_name ? user.full_name.charAt(0) : "U"}
                </div>
              )}
              {avatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/60 text-white text-xs font-bold backdrop-blur-xs">
                  ...
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{user.full_name}</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    user.identity_status === "verified"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user.identity_status === "verified" ? "Identidad Verificada" : "Identidad Pendiente"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
              <Camera className="h-4 w-4 text-blue-600" />
              <span>{user.avatar_url ? "Actualizar foto" : "Subir foto de perfil"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={avatarLoading}
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
        </div>
      )}

      {/* Segmented Pill Controls (Airbnb/Linear style) */}
      <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60 mb-8">
        <button
          onClick={() => setTab("guest")}
          className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            tab === "guest"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Mis Reservas (Huésped)
        </button>
        <button
          onClick={() => setTab("host")}
          className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            tab === "host"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Panel de Anfitrión (Mis Cocheras)
        </button>
      </div>

      {/* Guest Tab */}
      {tab === "guest" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Tus reservas de cochera</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Espacios reservados para dejar tu auto seguro durante tus viajes.
            </p>
          </div>

          {guestBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">Aún no tienes reservas activas</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Busca una cochera techada y reservada por vecinos verificados para tu próxima salida.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {guestBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">{b.spot?.title || "Cochera"}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          b.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : b.status === "approved"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : b.status === "pending_host"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {b.status === "pending_host" && "Esperando aprobación"}
                        {b.status === "approved" && "Aprobada (Lista para pagar)"}
                        {b.status === "paid" && "Pagada y Confirmada"}
                        {b.status === "cancelled" && "Cancelada"}
                        {b.status === "rejected" && "Rechazada"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {b.start_date} al {b.end_date} ({b.total_days} días)
                      </span>
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-900">
                      Total: ${(b.total_amount / 100).toFixed(0)} MXN
                      {b.refund_amount > 0 && (
                        <span className="ml-2 text-emerald-600 font-semibold">
                          (Reembolso: ${(b.refund_amount / 100).toFixed(0)} MXN)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status !== "cancelled" && b.status !== "rejected" && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        disabled={actionLoading === b.id}
                        className="rounded-xl border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Host Tab */}
      {tab === "host" && (
        <div className="space-y-8">
          {/* Stripe Connect Callout Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-200/80 bg-blue-50/50 p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Cobros y transferencias vía Stripe Connect Express
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                {user?.stripe_account_id
                  ? "Tu cuenta bancaria (CLABE) está vinculada mediante Stripe Express. Recibes transferencias automáticas por cada reserva completada."
                  : "Vincula tu cuenta bancaria vía Stripe Express para recibir pagos directos y automáticos de los viajeros."}
              </p>
            </div>
            <button
              onClick={handleStripeOnboard}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{user?.stripe_account_id ? "Gestionar Stripe Express" : "Conectar Stripe Express"}</span>
            </button>
          </div>

          {/* Pending Requests for Host */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Solicitudes de reserva pendientes</h2>
                <p className="text-xs text-slate-500">Viajeros que han solicitado dejar su auto en tu cochera.</p>
              </div>
            </div>

            {hostBookings.filter((b) => b.status === "pending_host").length === 0 ? (
              <p className="mt-3 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-xl p-4">
                No tienes solicitudes pendientes por responder en este momento.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {hostBookings
                  .filter((b) => b.status === "pending_host")
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-900">{b.spot?.title}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Huésped: <span className="font-semibold text-slate-800">{b.guest?.full_name}</span>{" "}
                          ({b.guest?.phone || "Tel. verificado"})
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Fechas: {b.start_date} al {b.end_date} ({b.total_days} días)
                        </p>
                        <p className="text-xs font-extrabold text-emerald-700 mt-1">
                          Tu ganancia neta estimada: ${(b.host_payout_amount / 100).toFixed(0)} MXN
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(b.id)}
                          disabled={actionLoading === b.id}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(b.id)}
                          disabled={actionLoading === b.id}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Published Spots */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mis cocheras publicadas</h2>
                <p className="text-xs text-slate-500">Espacios dados de alta en la plataforma.</p>
              </div>
              <button
                onClick={() => setIsNewSpotOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Publicar Cochera</span>
              </button>
            </div>

            {hostSpots.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                Aún no has dado de alta ninguna cochera. ¡Publica tu primer espacio para empezar a recibir viajeros!
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hostSpots.map((s) => (
                  <div
                    key={s.id}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white flex flex-col shadow-sm"
                  >
                    {/* Spot Cover Image (Fixed 16:10 aspect ratio) */}
                    <div className="relative aspect-[16/10] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                      {s.images && s.images.length > 0 ? (
                        <img
                          src={getMediaUrl(s.images[0]?.url)}
                          alt={s.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <Car className="h-10 w-10 text-slate-300" />
                          <span className="text-xs">Sin fotos publicadas</span>
                        </div>
                      )}

                      {/* Photo count badge */}
                      <div className="absolute top-3 right-3">
                        <span className="rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                          {s.images?.length || 0} {s.images?.length === 1 ? "foto" : "fotos"}
                        </span>
                      </div>

                      {/* Space type badge */}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                          {s.space_type === "covered"
                            ? "Techado"
                            : s.space_type === "pension"
                            ? "Pensión / Privado"
                            : "Al aire libre"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{s.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{s.address_line}, {s.city}</p>
                        <div className="mt-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-slate-900">
                              ${(s.price_per_day / 100).toFixed(0)} MXN <span className="font-normal text-slate-500">/ día</span>
                            </span>
                            {s.price_per_hour ? (
                              <span className="block text-[10px] text-slate-500 font-medium">
                                ${(s.price_per_hour / 100).toFixed(0)} MXN / hr
                              </span>
                            ) : null}
                          </div>
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/50">
                            {s.vehicle_size === "moto" ? "Moto / Cuatrimoto" : `Hasta ${s.vehicle_size.toUpperCase()}`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                          <Camera className="h-3.5 w-3.5 text-blue-600" />
                          <span>{spotPhotoLoading === s.id ? "Subiendo..." : "Agregar foto"}</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            disabled={spotPhotoLoading === s.id}
                            onChange={(e) => handleSpotPhotoUpload(s.id, e)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Spot Modal */}
      {isNewSpotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Publicar Nueva Cochera o Pensión</h2>
            <p className="text-xs text-slate-500 mt-1">
              Publica cualquier espacio seguro: cochera en casa techada o al aire libre, pensión vehicular, lote privado o estacionamiento particular. Recibe motos, autos o camionetas por horas o por días.
            </p>

            <form onSubmit={handleCreateSpot} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Título atractivo
                </label>
                <input
                  type="text"
                  required
                  value={newSpotTitle}
                  onChange={(e) => setNewSpotTitle(e.target.value)}
                  placeholder="Ej. Cochera techada con portón eléctrico cerca de Poliforum o Pensión segura"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Descripción detallada
                </label>
                <textarea
                  required
                  rows={3}
                  value={newSpotDesc}
                  onChange={(e) => setNewSpotDesc(e.target.value)}
                  placeholder="Detalla si es cochera particular, pensión o lote cerrado, tipo de acceso, portón eléctrico, vigilancia, referencias..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Dirección (Calle y número)
                  </label>
                  <input
                    type="text"
                    required
                    value={newSpotAddress}
                    onChange={(e) => setNewSpotAddress(e.target.value)}
                    placeholder="Ej. Blvd. Campestre 1204"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    required
                    value={newSpotCity}
                    onChange={(e) => setNewSpotCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tarifa / día ($ MXN) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newSpotPrice}
                    onChange={(e) => setNewSpotPrice(e.target.value)}
                    placeholder="150"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tarifa / hora ($ MXN) <span className="normal-case font-normal text-slate-400">(Opcional)</span>
                  </label>
                  <input
                    type="number"
                    value={newSpotPricePerHour}
                    onChange={(e) => setNewSpotPricePerHour(e.target.value)}
                    placeholder="Ej. 25"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Vehículo admitido
                  </label>
                  <select
                    value={newSpotSize}
                    onChange={(e) => setNewSpotSize(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="moto">Moto / Cuatrimoto</option>
                    <option value="compact">Auto compacto</option>
                    <option value="sedan">Sedán</option>
                    <option value="suv">Camioneta / SUV</option>
                    <option value="truck">Pickup / Grande</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tipo de espacio
                  </label>
                  <select
                    value={newSpotType}
                    onChange={(e) => setNewSpotType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="covered">Techado</option>
                    <option value="uncovered">Al aire libre</option>
                    <option value="pension">Pensión / Lote privado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Foto de tu cochera o espacio (Opcional)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Se optimizará a formato WebP ultraligero y seguro.</p>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span>{newSpotPhoto ? "Cambiar foto" : "Seleccionar foto"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewSpotPhoto(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {photoPreview && (
                    <div className="relative h-10 w-16 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  {newSpotPhoto && (
                    <span className="text-xs text-slate-600 truncate max-w-[150px] font-medium">{newSpotPhoto.name}</span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSpotOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={newSpotLoading}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {newSpotLoading ? "Publicando..." : "Publicar Espacio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Cargando panel...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
