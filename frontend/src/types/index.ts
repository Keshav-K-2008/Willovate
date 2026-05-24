// ── Enums ─────────────────────────────────────────────────────────────────────
export type OfferStatus = 'Draft' | 'Active' | 'Paused' | 'Expired' | 'Cancelled';
export type SlotStatus = 'Available' | 'Full' | 'Closed' | 'Expired' | 'Cancelled';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow';

// ── Models ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Business {
  id: number;
  name: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  openingTime: string;
  closingTime: string;
  createdAt: string;
}

export interface Offer {
  id: number;
  businessId: number;
  business?: Business;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  slots?: OfferSlot[];
}

export interface OfferSlot {
  id: number;
  offerId: number;
  offer?: Offer;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: SlotStatus;
  createdAt: string;
}

export interface Booking {
  id: number;
  bookingReference: string;
  offerId: number;
  offer?: Offer;
  slotId: number;
  slot?: OfferSlot;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  peopleCount: number;
  specialNote: string;
  status: BookingStatus;
  createdAt: string;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateOfferDto {
  businessId: number;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
  status: OfferStatus;
}

export interface CreateBookingDto {
  offerId: number;
  slotId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  peopleCount: number;
  specialNote: string;
}

export interface DashboardSummary {
  totalOffers: number;
  activeOffers: number;
  totalBookings: number;
  confirmedBookings: number;
  totalSlots: number;
  totalCapacity: number;
  totalBooked: number;
  recentBookings: RecentBooking[];
}

export interface RecentBooking {
  id: number;
  bookingReference: string;
  customerName: string;
  offerTitle: string;
  businessName: string;
  peopleCount: number;
  status: string;
  createdAt: string;
}

// ── Auth context ──────────────────────────────────────────────────────────────
export interface AuthState {
  token: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
}
