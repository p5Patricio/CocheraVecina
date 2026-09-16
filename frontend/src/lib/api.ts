const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  stripe_account_id?: string;
  identity_status: string;
}

export interface SpotImage {
  id: string;
  url: string;
  display_order: number;
}

export interface ParkingSpot {
  id: string;
  host_id: string;
  title: string;
  description: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  price_per_day: number; // in centavos
  vehicle_size: string;
  space_type: string;
  access_instructions?: string;
  is_active: boolean;
  images: SpotImage[];
  host?: User;
}

export interface BookingQuote {
  spot_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  base_amount: number;
  guest_fee_amount: number;
  host_fee_amount: number;
  total_amount: number;
  host_payout_amount: number;
  currency: string;
}

export interface Booking {
  id: string;
  spot_id: string;
  guest_id: string;
  start_date: string;
  end_date: string;
  status: string;
  daily_rate: number;
  total_days: number;
  base_amount: number;
  guest_fee_amount: number;
  host_fee_amount: number;
  total_amount: number;
  host_payout_amount: number;
  currency: string;
  cancellation_reason?: string;
  refund_amount: number;
  spot?: ParkingSpot;
  guest?: User;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "Error en la petición";
    try {
      const data = await response.json();
      errorDetail = data.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ access_token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
      request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: (token: string) =>
      request<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    uploadAvatar: async (token: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error al subir el avatar");
      }
      return res.json();
    },
  },
  spots: {
    search: (params?: { city?: string; vehicle_size?: string; space_type?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<ParkingSpot[]>(`/spots/${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<ParkingSpot>(`/spots/${id}`),
    create: (token: string, data: any) =>
      request<ParkingSpot>("/spots/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    uploadPhoto: async (token: string, spotId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/spots/${spotId}/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error al subir la imagen");
      }
      return res.json();
    },
    getMySpots: (token: string) =>
      request<ParkingSpot[]>("/spots/my-spots", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getQuote: (spotId: string, startDate: string, endDate: string) =>
      request<BookingQuote>(`/spots/${spotId}/quote`, {
        method: "POST",
        body: JSON.stringify({ spot_id: spotId, start_date: startDate, end_date: endDate }),
      }),
  },
  bookings: {
    create: (token: string, spotId: string, startDate: string, endDate: string) =>
      request<Booking>("/bookings/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ spot_id: spotId, start_date: startDate, end_date: endDate }),
      }),
    getMyBookings: (token: string) =>
      request<Booking[]>("/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getHostBookings: (token: string) =>
      request<Booking[]>("/bookings/host-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    updateStatus: (token: string, bookingId: string, status: "approved" | "rejected") =>
      request<Booking>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      }),
    cancel: (token: string, bookingId: string, cancellation_reason?: string) =>
      request<Booking>(`/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cancellation_reason }),
      }),
  },
  payments: {
    getHostOnboardingUrl: (token: string) =>
      request<{ url: string }>("/payments/host/onboard", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    createIntent: (token: string, bookingId: string) =>
      request<{ client_secret: string; payment_intent_id: string; amount: number; currency: string }>(
        `/payments/bookings/${bookingId}/create-intent`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      ),
  },
};
