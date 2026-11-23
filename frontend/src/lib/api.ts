/**
 * StageTix API Service
 * Connects Next.js frontend to Laravel 11 REST API backend
 * Supports Vercel Multi-Services Binding (BACKEND_SERVICE_URL) on server-side
 * and relative path (/api/v1) or NEXT_PUBLIC_API_URL on client-side.
 */

function getApiBase(): string {
  if (typeof window === 'undefined') {
    // Server-side (SSR / Server Component / Serverless Function)
    if (process.env.BACKEND_SERVICE_URL) {
      return `${process.env.BACKEND_SERVICE_URL.replace(/\/$/, '')}/api/v1`;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
  }
  
  // Client-side (Browser)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production on Vercel with rewrites, relative path avoids CORS
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/v1';
  }

  return 'http://127.0.0.1:8000/api/v1';
}

const API_BASE = getApiBase();

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const base = typeof window === 'undefined' ? getApiBase() : API_BASE;
  const url = `${base}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors as Record<string, string[]>).flat().join(', ') : 'API Error');
    throw new Error(message);
  }

  return data as T;
}

// ─── Types (mirrors Laravel response shapes) ─────────────────────────────────

export interface ApiConcert {
  id: number;
  slug: string;
  title: string;
  artist: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string | null;
  banner_image: string | null;
  description: string;
  is_popular: boolean;
  is_selling_fast: boolean;
  min_price: number;
  total_stock?: number;
  remaining_stock?: number;
  is_sold_out?: boolean;
  ticket_tiers: ApiTicketTier[];
}

export interface ApiTicketTier {
  id: number;
  concert_id: number;
  name: string;
  price: number;
  description: string;
  total_quantity: number;
  available_quantity: number;
  perks: string[] | null;
}

export interface ApiOrder {
  id: number;
  order_number: string;
  concert_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_identity_no: string;
  subtotal: number;
  service_fee: number;
  payment_fee: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  virtual_account_no: string | null;
  qr_code_url: string | null;
  expires_at: string;
  snap_token?: string | null;
  concert?: ApiConcert;
  items?: ApiOrderItem[];
  tickets?: ApiTicket[];
}

export interface ApiOrderItem {
  id: number;
  order_id: number;
  ticket_tier_id: number;
  tier_name: string;
  price: number;
  quantity: number;
}

export interface ApiTicket {
  id: number;
  ticket_code: string;
  order_id: number;
  tier_name: string;
  seat_number: string;
  holder_name: string;
  qr_code_data: string;
  status: 'ACTIVE' | 'USED' | 'CANCELLED';
  order?: ApiOrder & { concert?: ApiConcert };
}

export interface CheckoutPayload {
  concert_id: number;
  ticket_tier_id: number;
  quantity: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_identity_no: string;
  payment_method: string;
  promo_code?: string;
}

// ─── Concert Endpoints ────────────────────────────────────────────────────────

export const concertApi = {
  list(params?: { category?: string; search?: string }) {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== 'All') qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch<{ status: string; data: ApiConcert[] }>(`/concerts${query}`);
  },

  get(idOrSlug: string | number) {
    return apiFetch<{ status: string; data: ApiConcert }>(`/concerts/${idOrSlug}`);
  },
};

// ─── Order Endpoints ──────────────────────────────────────────────────────────

export const orderApi = {
  checkout(payload: CheckoutPayload) {
    return apiFetch<{ status: string; message: string; data: ApiOrder }>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  get(orderNumber: string) {
    return apiFetch<{ status: string; data: ApiOrder }>(`/orders/${orderNumber}`);
  },

  getSnapToken(orderNumber: string) {
    return apiFetch<{ status: string; token: string; redirect_url?: string }>(`/orders/${orderNumber}/snap-token`, {
      method: 'POST',
    });
  },
};

// ─── Queue / Virtual Waiting Room ─────────────────────────────────────────────

export interface ApiQueueStatus {
  session_id: string;
  concert_id: number;
  concert_title: string;
  queue_number: number;
  position_in_line: number;
  queue_status: 'waiting' | 'admitted' | 'expired';
  estimated_wait_seconds: number;
  estimated_wait_human: string;
  session_expires_at?: string;
  remaining_seconds_to_checkout?: number;
}

export const queueApi = {
  join(concertId: string | number, sessionId?: string) {
    return apiFetch<{ status: string; data: ApiQueueStatus }>(`/concerts/${concertId}/queue/join`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  getStatus(concertId: string | number, sessionId: string) {
    return apiFetch<{ status: string; data: ApiQueueStatus }>(`/concerts/${concertId}/queue/status?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
    });
  },

  admitBatch(concertId: string | number, batchSize = 50) {
    return apiFetch<{ status: string; message: string; current_admitted_cutoff: number }>(`/admin/concerts/${concertId}/queue/admit`, {
      method: 'POST',
      body: JSON.stringify({ batch_size: batchSize }),
    });
  },
};

// ─── Ticket & Gate Scanner Endpoints ──────────────────────────────────────────

export const ticketApi = {
  get(ticketCode: string) {
    return apiFetch<{ status: string; data: ApiTicket }>(`/tickets/${ticketCode}`);
  },

  scan(ticketCode: string, gateName = 'Main Gate') {
    return apiFetch<{
      status: string;
      result: 'GRANTED' | 'ALREADY_USED' | 'INVALID' | 'UNPAID';
      message: string;
      data?: any;
    }>('/gate/scan', {
      method: 'POST',
      body: JSON.stringify({ ticket_code: ticketCode, gate_name: gateName }),
    });
  },
};

// ─── Organizer Analytics ───────────────────────────────────────────────────────

export const organizerApi = {
  getStats() {
    return apiFetch<{
      status: string;
      data: {
        total_concerts: number;
        total_orders: number;
        paid_orders: number;
        total_revenue: number;
        tickets: {
          total: number;
          scanned: number;
          active: number;
          scan_rate_percentage: number;
        };
        recent_scans: any[];
      };
    }>('/organizer/stats');
  },
};

// ─── Webhook / Payment Simulator ─────────────────────────────────────────────

export const webhookApi = {
  simulatePayment(orderNumber: string, status: 'settlement' | 'cancel' | 'expire' = 'settlement') {
    return apiFetch<{ status: string; message: string; order: ApiOrder }>('/webhooks/payment', {
      method: 'POST',
      body: JSON.stringify({
        order_number: orderNumber,
        transaction_status: status,
      }),
    });
  },
};
