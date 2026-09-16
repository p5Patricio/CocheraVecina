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
      const createdSpot = await api.spots.create(token, {
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
      });

      if (newSpotPhoto && createdSpot && createdSpot.id) {
        try {
          await api.spots.uploadPhoto(token, createdSpot.id, newSpotPhoto);
        } catch (uploadErr) {
          console.error("Error subiendo foto:", uploadErr);
        }
      }

      setIsNewSpotOpen(false);
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
      {/* Profile Header Card */}
      {user && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={getMediaUrl(user.avatar_url)}
                  alt={user.full_name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-blue-600 shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400">
                  <Camera className="h-7 w-7" />
                </div>
              )}
              {avatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white text-xs font-bold">
                  ...
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user.full_name}</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user.identity_status === "verified"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
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
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm">
              <Camera className="h-4 w-4 text-blue-600" />
              <span>{user.avatar_url ? "Cambiar foto de perfil" : "Subir foto"}</span>
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

      {/* Dashboard Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab("guest")}
          className={`border-b-2 py-3 px-6 text-sm font-bold transition ${
            tab === "guest"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Mis Reservas (Como Huésped)
        </button>
        <button
          onClick={() => setTab("host")}
          className={`border-b-2 py-3 px-6 text-sm font-bold transition ${
            tab === "host"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Panel de Anfitrión (Mis Cocheras)
        </button>
      </div>

      {/* Guest Tab */}
      {tab === "guest" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">Tus reservas de cochera</h2>
          <p className="text-xs text-slate-500 mt-1">
            Espacios reservados para dejar tu auto seguro mientras viajas.
          </p>

          {guestBookings.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">Aún no tienes reservas</h3>
              <p className="mt-1 text-xs text-slate-500">
                Busca un espacio seguro para tu próximo viaje.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {guestBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{b.spot?.title || "Cochera"}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          b.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : b.status === "approved"
                            ? "bg-blue-100 text-blue-700"
                            : b.status === "pending_host"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
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
                      {b.start_date} al {b.end_date} ({b.total_days} días)
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      Total: ${(b.total_amount / 100).toFixed(0)} MXN
                      {b.refund_amount > 0 && (
                        <span className="ml-2 text-green-600 font-semibold">
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
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
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
        <div className="mt-8 space-y-8">
          {/* Stripe Connect Callout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Cobros automáticos con Stripe Connect</h3>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {user?.stripe_account_id
                  ? "Tu cuenta de Stripe Express está conectada. Los pagos van directo a tu cuenta bancaria (CLABE)."
                  : "Configura tu cuenta bancaria vía Stripe Express para recibir transferencias automáticas de tus reservas."}
              </p>
            </div>
            <button
              onClick={handleStripeOnboard}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {user?.stripe_account_id ? "Gestionar en Stripe" : "Conectar Stripe Connect"}
            </button>
          </div>

          {/* Pending Requests for Host */}
          <div>
            <h2 className="text-lg font-bold text-slate-900">Solicitudes de reserva pendientes</h2>
            {hostBookings.filter((b) => b.status === "pending_host").length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">No tienes solicitudes pendientes por responder.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {hostBookings
                  .filter((b) => b.status === "pending_host")
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-900">{b.spot?.title}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Huésped: <span className="font-semibold">{b.guest?.full_name}</span> ({b.guest?.phone || "Sin tel."})
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Fechas: {b.start_date} al {b.end_date} ({b.total_days} días)
                        </p>
                        <p className="text-xs font-bold text-green-700 mt-1">
                          Tu ganancia neta: ${(b.host_payout_amount / 100).toFixed(0)} MXN
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(b.id)}
                          disabled={actionLoading === b.id}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(b.id)}
                          disabled={actionLoading === b.id}
                          className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300"
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
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Publicar Cochera
              </button>
            </div>

            {hostSpots.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                Aún no has publicado ninguna cochera. ¡Publica la primera ahora!
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hostSpots.map((s) => (
                  <div key={s.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white flex flex-col">
                    {/* Spot Cover Image */}
                    <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                      {s.images && s.images.length > 0 ? (
                        <img
                          src={getMediaUrl(s.images[0]?.url)}
                          alt={s.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <Car className="h-8 w-8 text-slate-300" />
                          <span className="text-[11px]">Sin fotos publicadas</span>
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          {s.images?.length || 0} {s.images?.length === 1 ? "foto" : "fotos"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{s.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{s.address_line}, {s.city}</p>
                        <div className="mt-3 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900">${(s.price_per_day / 100).toFixed(0)} MXN / día</span>
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-600">
                            {s.vehicle_size.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900">Publicar Nueva Cochera</h2>
            <p className="text-xs text-slate-500 mt-1">Completa los detalles de tu espacio en León o tu ciudad.</p>

            <form onSubmit={handleCreateSpot} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Título atractivo</label>
                <input
                  type="text"
                  required
                  value={newSpotTitle}
                  onChange={(e) => setNewSpotTitle(e.target.value)}
                  placeholder="Ej. Cochera techada cerca de Poliforum"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Descripción detallada</label>
                <textarea
                  required
                  rows={3}
                  value={newSpotDesc}
                  onChange={(e) => setNewSpotDesc(e.target.value)}
                  placeholder="Seguridad, portón eléctrico, vigilancia vecinal..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Dirección</label>
                  <input
                    type="text"
                    required
                    value={newSpotAddress}
                    onChange={(e) => setNewSpotAddress(e.target.value)}
                    placeholder="Calle y número"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Ciudad</label>
                  <input
                    type="text"
                    required
                    value={newSpotCity}
                    onChange={(e) => setNewSpotCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Precio / día ($ MXN)</label>
                  <input
                    type="number"
                    required
                    value={newSpotPrice}
                    onChange={(e) => setNewSpotPrice(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Vehículo</label>
                  <select
                    value={newSpotSize}
                    onChange={(e) => setNewSpotSize(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  >
                    <option value="compact">Compacto</option>
                    <option value="sedan">Sedán</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Pickup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Espacio</label>
                  <select
                    value={newSpotType}
                    onChange={(e) => setNewSpotType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
                  >
                    <option value="covered">Techado</option>
                    <option value="uncovered">Al aire libre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Foto de tu cochera (Opcional)</label>
                <p className="text-[11px] text-slate-500 mb-1.5">Se convertirá a formato WebP ultraligero y seguro.</p>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
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
                    <div className="relative h-10 w-14 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  {newSpotPhoto && (
                    <span className="text-xs text-slate-600 truncate max-w-[150px]">{newSpotPhoto.name}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSpotOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={newSpotLoading}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {newSpotLoading ? "Guardando..." : "Publicar"}
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
