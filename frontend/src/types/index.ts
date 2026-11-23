export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  perks: string[];
}

export interface Concert {
  id: string;
  slug: string;
  title: string;
  artist: string;
  category: 'Pop' | 'Rock' | 'EDM' | 'Jazz' | 'K-Pop' | 'Festival';
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string;
  bannerImage: string;
  description: string;
  isPopular?: boolean;
  isSellingFast?: boolean;
  minPrice: number;
  totalStock?: number;
  remainingStock?: number;
  isSoldOut?: boolean;
  ticketTiers: TicketTier[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  category: 'qris' | 'virtual_account' | 'e_wallet' | 'card' | 'retail';
  icon: string;
  fee: number;
  adminFeeType: 'flat' | 'percentage';
  accountNumber?: string;
  instructions: string[];
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  identityNo: string;
}

export interface OrderItem {
  tierId: string;
  tierName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  concertId: string;
  concertTitle: string;
  concertImage: string;
  concertDate: string;
  concertVenue: string;
  items: OrderItem[];
  customer: CustomerInfo;
  subtotal: number;
  serviceFee: number;
  paymentFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentMethodName: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
  virtualAccountNo?: string;
  qrCodeUrl?: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  concertTitle: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  tierName: string;
  seatNumber: string;
  holderName: string;
  qrCode: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
}
