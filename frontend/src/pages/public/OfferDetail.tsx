import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOfferById, getSlotsByOffer } from '../../api/offers';
import type { Offer, OfferSlot } from '../../types';

export default function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offerId) return;
    const id = parseInt(offerId);
    Promise.all([getOfferById(id), getSlotsByOffer(id)])
      .then(([o, s]) => {
        setOffer(o);
        setSlots(s);
      })
      .catch(() => toast.error('Failed to load offer details.'))
      .finally(() => setLoading(false));
  }, [offerId]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-slate-400 hover:text-brand-500 mb-8 font-semibold transition-colors">
        ← Back to Offers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Offer Information */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card bg-dark-800/40 p-8 border border-dark-600/60 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-900/40 text-brand-400 border border-brand-500/25">
                {offer.category}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-dark-700/40 px-3 py-1 rounded-full">
                📅 {offer.startDate} to {offer.endDate}
              </span>
            </div>

            <h1 className="font-display font-black text-4xl text-slate-100 tracking-tight leading-tight mb-4">
              {offer.title}
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed mb-6 whitespace-pre-line">
              {offer.description}
            </p>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-4 py-4 border-y border-dark-700/40 mb-6">
              <span className="text-4xl font-black text-slate-100">${offer.offerPrice}</span>
              <span className="text-xl text-slate-500 line-through">${offer.originalPrice}</span>
              <span className="text-sm font-extrabold px-3 py-1 rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/20 animate-pulse ml-2">
                {offer.discountPercentage}% OFF
              </span>
            </div>

            {/* Booking rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-dark-700/20 p-5 rounded-2xl border border-dark-700/30">
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Daily Slot Hours</span>
                <p className="text-slate-200 font-semibold mt-0.5">🕒 {offer.startTime.substring(0, 5)} - {offer.endTime.substring(0, 5)}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Booking Limit</span>
                <p className="text-slate-200 font-semibold mt-0.5">👤 Max {offer.maxBookingPerCustomer} seats per customer</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {offer.termsAndConditions && (
            <div className="card bg-dark-800/40 p-8 border border-dark-600/60 rounded-3xl">
              <h2 className="font-display font-black text-xl text-slate-100 mb-4">Terms & Conditions</h2>
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                {offer.termsAndConditions}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Business and Slots */}
        <div className="space-y-8">
          {/* Business Info */}
          {offer.business && (
            <div className="card bg-dark-800/40 p-8 border border-dark-600/60 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏢</span>
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dark-700 text-slate-300">
                    {offer.business.businessType}
                  </span>
                  <h2 className="font-display font-bold text-lg text-slate-100 mt-1">{offer.business.name}</h2>
                </div>
              </div>
              
              <div className="space-y-3.5 pt-4 border-t border-dark-700/50 text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="text-slate-500 mt-0.5">📍</span>
                  <span>{offer.business.address}, {offer.business.city}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500">📞</span>
                  <span>{offer.business.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500">✉️</span>
                  <span>{offer.business.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500">🕒</span>
                  <span>{offer.business.openingTime} - {offer.business.closingTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Slots list */}
          <div className="card bg-dark-800/40 p-8 border border-dark-600/60 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-slate-100">Available Slots</h2>
              <span className="text-xs bg-brand-500/10 text-brand-400 px-2.5 py-0.5 rounded-full font-semibold">
                {slots.filter(s => s.status === 'Available').length} Open
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {slots.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No slots generated for this offer.</p>
              ) : (
                slots.map(s => {
                  const isAvailable = s.status === 'Available';
                  const seatsLeft = s.capacity - s.bookedCount;
                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        isAvailable
                          ? 'bg-dark-750/30 border-dark-600/50 hover:border-brand-500/60'
                          : 'bg-dark-900/20 border-dark-800 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-slate-300 font-semibold text-sm">📅 {s.slotDate}</span>
                          <p className="text-slate-400 text-xs mt-0.5">🕒 {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isAvailable
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {isAvailable ? `${seatsLeft} left` : 'Full'}
                        </span>
                      </div>
                      
                      {isAvailable && (
                        <button
                          onClick={() => navigate(`/offers/${offer.id}/book`, { state: { preselectedSlotId: s.id } })}
                          className="w-full text-center py-2 mt-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs tracking-wide active:scale-95 transition-all shadow-md shadow-brand-500/10"
                        >
                          Book Slot
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {slots.some(s => s.status === 'Available') && (
              <button
                onClick={() => navigate(`/offers/${offer.id}/book`)}
                className="w-full btn-primary mt-6 text-sm py-3 flex items-center justify-center gap-2"
              >
                ⚡ Instant Booking Flow
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
