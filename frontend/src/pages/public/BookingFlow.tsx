import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOfferById, getSlotsByOffer, createBooking } from '../../api/offers';
import type { Offer, OfferSlot, Booking } from '../../types';
import StatusBadge from '../../components/StatusBadge';

type Step = 'form' | 'confirmation';

export default function BookingFlow() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedSlotId = location.state?.preselectedSlotId;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [booking, setBooking] = useState<Booking | null>(null);

  const [form, setForm] = useState({
    slotId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    peopleCount: '1',
    specialNote: '',
  });

  useEffect(() => {
    if (!offerId) return;
    const id = parseInt(offerId);
    Promise.all([getOfferById(id), getSlotsByOffer(id)])
      .then(([o, s]) => {
        setOffer(o);
        const availableSlots = s.filter(sl => sl.status === 'Available');
        setSlots(availableSlots);
        
        if (preselectedSlotId && availableSlots.some(sl => sl.id === preselectedSlotId)) {
          setForm(prev => ({ ...prev, slotId: String(preselectedSlotId) }));
        }
      })
      .catch(() => toast.error('Failed to load offer.'))
      .finally(() => setLoading(false));
  }, [offerId, preselectedSlotId]);

  const selectedSlot = slots.find(s => s.id === +form.slotId);
  const availableSeats = selectedSlot ? selectedSlot.capacity - selectedSlot.bookedCount : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.slotId) { toast.error('Please select a slot.'); return; }
    if (+form.peopleCount > availableSeats) {
      toast.error(`Only ${availableSeats} seat(s) available in this slot.`);
      return;
    }
    setSubmitting(true);
    try {
      const result = await createBooking({
        offerId: parseInt(offerId!),
        slotId: +form.slotId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        peopleCount: +form.peopleCount,
        specialNote: form.specialNote,
      });
      setBooking(result);
      setStep('confirmation');
      toast.success('Booking confirmed! 🎉');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">😕</div>
        <h2 className="font-display text-2xl text-slate-100">Offer not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Offers</button>
      </div>
    );
  }

  // ── Confirmation Screen ────────────────────────────────────────────────────
  if (step === 'confirmation' && booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full animate-slide-up">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 mb-5">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="font-display font-black text-4xl text-slate-100 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-400">Your slot has been reserved successfully.</p>
          </div>

          {/* Reference Card */}
          <div className="card border-brand-500 mb-6">
            <div className="text-center mb-6">
              <p className="text-slate-400 text-sm mb-2">Booking Reference</p>
              <span className="font-mono font-bold text-3xl text-brand-400 tracking-widest bg-brand-900 px-4 py-2 rounded-xl inline-block">
                {booking.bookingReference}
              </span>
            </div>

            <div className="divide-y divide-dark-600 text-sm">
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={booking.status} />
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Customer</span>
                <span className="text-slate-200 font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Offer</span>
                <span className="text-slate-200 font-medium text-right max-w-[60%]">{offer.title}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Business</span>
                <span className="text-slate-200 font-medium">{offer.business?.name}</span>
              </div>
              {booking.slot && (
                <>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-500">Date</span>
                    <span className="text-slate-200">{booking.slot.slotDate}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-500">Time</span>
                    <span className="text-slate-200">{booking.slot.startTime} – {booking.slot.endTime}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-3">
                <span className="text-slate-500">People</span>
                <span className="text-slate-200">{booking.peopleCount}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Offer Price</span>
                <span className="text-brand-400 font-bold">₹{offer.offerPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="btn-secondary flex-1 text-sm">
              Browse More
            </button>
            <button
              onClick={() => { window.print(); }}
              className="btn-primary flex-1 text-sm"
            >
              🖨️ Save / Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking Form ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-300 mb-6 inline-flex items-center gap-1">
        ← Back to Offers
      </button>

      {/* Offer Summary */}
      <div className="card mb-8 border-brand-500">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-brand-400 bg-brand-900 px-2 py-1 rounded-full">{offer.category}</span>
            <h2 className="font-display font-bold text-2xl text-slate-100 mt-2">{offer.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{offer.business?.name} • {offer.business?.city}</p>
          </div>
          <StatusBadge status={offer.status} size="md" />
        </div>
        <div className="flex items-center gap-4">
          <span className="font-display font-black text-3xl text-brand-400">₹{offer.offerPrice.toLocaleString()}</span>
          <span className="text-slate-500 line-through text-lg">₹{offer.originalPrice.toLocaleString()}</span>
          <span className="text-emerald-400 font-semibold text-sm bg-emerald-900/30 px-2.5 py-1 rounded-full">
            {offer.discountPercentage.toFixed(0)}% OFF
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Slot Selection */}
        {slots.length > 0 && (
          <div className="card">
            <h3 className="font-display font-bold text-lg text-slate-100 mb-4">Select a Slot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map(slot => {
                const available = slot.capacity - slot.bookedCount;
                const selected = +form.slotId === slot.id;
                return (
                  <label
                    key={slot.id}
                    className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selected
                        ? 'border-brand-500 bg-brand-100 dark:bg-brand-900/40'
                        : 'border-dark-600 bg-dark-700 hover:border-brand-500'
                    }`}
                  >
                    <input type="radio" name="slotId" value={slot.id} checked={selected}
                      onChange={handleChange} className="sr-only" />
                    <span className="font-semibold text-slate-100 text-sm">📅 {slot.slotDate}</span>
                    <span className="text-slate-400 text-sm">⏰ {slot.startTime} – {slot.endTime}</span>
                    <span className={`text-xs font-medium mt-1 ${available <= 3 ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {available} seat{available !== 1 ? 's' : ''} left
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer Details */}
        <div className="card">
          <h3 className="font-display font-bold text-lg text-slate-100 mb-5">Your Details</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange}
                required className="input-field" placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone *</label>
                <input name="customerPhone" value={form.customerPhone} onChange={handleChange}
                  required className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="customerEmail" value={form.customerEmail} onChange={handleChange}
                  type="email" className="input-field" placeholder="you@email.com" />
              </div>
            </div>
            <div>
              <label className="label">Number of People *</label>
              <input name="peopleCount" value={form.peopleCount} onChange={handleChange}
                type="number" min={1} max={selectedSlot ? availableSeats : 99}
                required className="input-field" />
              {selectedSlot && (
                <p className="text-xs text-slate-500 mt-1">Max {availableSeats} people for this slot</p>
              )}
            </div>
            <div>
              <label className="label">Special Note</label>
              <textarea name="specialNote" value={form.specialNote} onChange={handleChange}
                rows={2} className="input-field resize-none"
                placeholder="Any allergies, preferences, or special requests…" />
            </div>
          </div>
        </div>

        {/* Summary & Submit */}
        {form.slotId && (
          <div className="card bg-brand-900/20 border-brand-700/50">
            <p className="text-sm text-slate-400 mb-1">You are booking</p>
            <p className="font-display font-bold text-xl text-slate-100">{offer.title}</p>
            <p className="text-slate-300 text-sm mt-1">
              {form.peopleCount} person(s) · ₹{(offer.offerPrice * +form.peopleCount).toLocaleString()} total
            </p>
          </div>
        )}

        <button type="submit" disabled={submitting || slots.length === 0}
          className="btn-primary py-4 text-base flex items-center justify-center gap-2">
          {submitting ? (
            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>Confirming…</>
          ) : slots.length === 0 ? (
            '❌ No Available Slots for this Offer'
          ) : (
            '🎟️ Confirm Booking'
          )}
        </button>
      </form>
    </div>
  );
}
