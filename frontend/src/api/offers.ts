import client from './client';
import type { Offer, CreateOfferDto, OfferSlot, DashboardSummary } from '../types';

// ── Offers ────────────────────────────────────────────────────────────────────
export const getPublicOffers = (params?: {
  businessType?: string;
  category?: string;
  date?: string;
}) => client.get<Offer[]>('/api/offers', { params }).then((r) => r.data);

export const getAllOffersAdmin = () =>
  client.get<Offer[]>('/api/offers/all').then((r) => r.data);

export const getOfferById = (id: number) =>
  client.get<Offer>(`/api/offers/${id}`).then((r) => r.data);

export const createOffer = (data: CreateOfferDto) =>
  client.post<Offer>('/api/offers', data).then((r) => r.data);

export const updateOffer = (id: number, data: CreateOfferDto) =>
  client.put<Offer>(`/api/offers/${id}`, data).then((r) => r.data);

export const deleteOffer = (id: number) =>
  client.delete(`/api/offers/${id}`).then((r) => r.data);

// ── Slots ─────────────────────────────────────────────────────────────────────
export const getSlotsByOffer = (offerId: number) =>
  client.get<OfferSlot[]>(`/api/offers/${offerId}/slots`).then((r) => r.data);

export const createSlot = (data: {
  offerId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
}) => client.post<OfferSlot>('/api/slots', data).then((r) => r.data);

// ── Businesses ────────────────────────────────────────────────────────────────
export const getBusinesses = () =>
  client.get('/api/business').then((r) => r.data);

// ── Bookings ──────────────────────────────────────────────────────────────────
export const createBooking = (data: {
  offerId: number;
  slotId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  peopleCount: number;
  specialNote: string;
}) => client.post('/api/bookings', data).then((r) => r.data);

export const getAllBookings = () =>
  client.get('/api/bookings').then((r) => r.data);

export const updateBookingStatus = (id: number, status: string) =>
  client.put(`/api/bookings/${id}/status`, { status }).then((r) => r.data);

export const deleteBooking = (id: number) =>
  client.delete(`/api/bookings/${id}`).then((r) => r.data);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardSummary = () =>
  client.get<DashboardSummary>('/api/dashboard/summary').then((r) => r.data);
