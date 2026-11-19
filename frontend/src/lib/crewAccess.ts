// crewAccess.ts - Manajemen Hak Akses Kru & Admin dengan Persetujuan Super Admin

export const SUPER_ADMIN_EMAIL = 'fuadhasdi3@gmail.com';

export interface CrewRequest {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'scanner' | 'organizer' | 'admin';
  roleLabel: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  notes?: string;
}

const STORAGE_KEY = 'stagetix_crew_requests';

const INITIAL_REQUESTS: CrewRequest[] = [];

export function getCrewRequests(): CrewRequest[] {
  if (typeof window === 'undefined') return INITIAL_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading crew requests:', e);
    return INITIAL_REQUESTS;
  }
}

export function saveCrewRequests(requests: CrewRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed saving crew requests:', e);
  }
}

export function checkCrewStatus(email?: string | null): {
  isSuperAdmin: boolean;
  isApproved: boolean;
  status: 'SUPER_ADMIN' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE';
  request?: CrewRequest;
} {
  if (!email) {
    return { isSuperAdmin: false, isApproved: false, status: 'NONE' };
  }

  const normalized = email.trim().toLowerCase();

  // Super Admin selalu memiliki hak akses penuh & permanen
  if (normalized === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { isSuperAdmin: true, isApproved: true, status: 'SUPER_ADMIN' };
  }

  const requests = getCrewRequests();
  const found = requests.find(r => r.email.trim().toLowerCase() === normalized);

  if (!found) {
    return { isSuperAdmin: false, isApproved: false, status: 'NONE' };
  }

  return {
    isSuperAdmin: false,
    isApproved: found.status === 'APPROVED',
    status: found.status,
    request: found,
  };
}

export function submitCrewRequest(data: {
  email: string;
  fullName: string;
  phone?: string;
  role: 'scanner' | 'organizer' | 'admin';
  notes?: string;
}): { success: boolean; message: string; request: CrewRequest } {
  const normalized = data.email.trim().toLowerCase();

  if (normalized === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return {
      success: true,
      message: 'Email ini adalah Super Admin Utama, tidak memerlukan persetujuan.',
      request: {
        id: 'REQ-SUPERADMIN',
        email: normalized,
        fullName: 'Super Admin',
        role: 'admin',
        roleLabel: 'Super Admin Utama',
        status: 'APPROVED',
        requestedAt: new Date().toISOString()
      }
    };
  }

  const requests = getCrewRequests();
  const existingIndex = requests.findIndex(r => r.email.trim().toLowerCase() === normalized);

  const roleLabels: Record<string, string> = {
    scanner: 'Kru Scanner Gate Masuk',
    organizer: 'Mitra Promotor Event',
    admin: 'Akses Portal Admin'
  };

  const newRequest: CrewRequest = {
    id: `REQ-${Date.now().toString().slice(-6)}`,
    email: normalized,
    fullName: data.fullName,
    phone: data.phone || '',
    role: data.role,
    roleLabel: roleLabels[data.role] || data.role,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    notes: data.notes || 'Pengajuan akses kru dari halaman login'
  };

  if (existingIndex >= 0) {
    // Perbarui permohonan yang ada jika sebelumnya ditolak / minta lagi
    requests[existingIndex] = {
      ...requests[existingIndex],
      ...newRequest,
      id: requests[existingIndex].id
    };
  } else {
    requests.unshift(newRequest);
  }

  saveCrewRequests(requests);

  return {
    success: true,
    message: `Permohonan telah dikirim! Menunggu persetujuan dari Super Admin (${SUPER_ADMIN_EMAIL}).`,
    request: newRequest
  };
}

export function updateRequestStatus(id: string, status: 'APPROVED' | 'REJECTED'): boolean {
  const requests = getCrewRequests();
  const item = requests.find(r => r.id === id);
  if (!item) return false;

  item.status = status;
  item.reviewedAt = new Date().toISOString();
  saveCrewRequests(requests);
  return true;
}

export function revokeCrewAccess(email: string): boolean {
  const requests = getCrewRequests();
  const normalized = email.trim().toLowerCase();
  const updated = requests.filter(r => r.email.trim().toLowerCase() !== normalized);
  saveCrewRequests(updated);
  return true;
}
