import { Link } from 'react-router-dom';
import type { Offer } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  offer: Offer;
  showBookButton?: boolean;
}

export default function OfferCard({ offer, showBookButton = true }: Props) {
  const categoryColors: Record<string, string> = {
    Food: 'text-amber-400 bg-amber-900/30',
    Fitness: 'text-emerald-400 bg-emerald-900/30',
    Beauty: 'text-pink-400 bg-pink-900/30',
    Travel: 'text-blue-400 bg-blue-900/30',
    Entertainment: 'text-purple-400 bg-purple-900/30',
  };
  const catStyle = categoryColors[offer.category] || 'text-brand-400 bg-brand-900';

  return (
    <div className="card group flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${catStyle}`}>
            {offer.category}
          </span>
          <h3 className="font-display font-bold text-lg text-slate-100 leading-snug line-clamp-2 group-hover:text-brand-500 transition-colors">
            {offer.title}
          </h3>
        </div>
        <StatusBadge status={offer.status} />
      </div>

      {/* Business */}
      {offer.business && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="text-brand-500">🏪</span>
          <span className="font-medium text-slate-300">{offer.business.name}</span>
          <span className="text-dark-500">•</span>
          <span>{offer.business.businessType}</span>
        </div>
      )}

      {/* Description */}
      {offer.description && (
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {offer.description}
        </p>
      )}

      {/* Pricing */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-display font-bold text-brand-400">
            ₹{offer.offerPrice.toLocaleString()}
          </span>
          <span className="text-slate-500 line-through text-sm">
            ₹{offer.originalPrice.toLocaleString()}
          </span>
        </div>
        <span className="ml-auto text-xs font-bold bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 px-2.5 py-1 rounded-full">
          {offer.discountPercentage.toFixed(0)}% OFF
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-dark-600 pt-3">
        <span>📅 {offer.startDate} – {offer.endDate}</span>
        {offer.business && <span className="ml-auto">📍 {offer.business.city}</span>}
      </div>

      {/* CTA */}
      {showBookButton && (
        <Link
          to={`/offers/${offer.id}/book`}
          className="btn-primary text-center text-sm mt-1"
        >
          Book Now →
        </Link>
      )}
    </div>
  );
}
