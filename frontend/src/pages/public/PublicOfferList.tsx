import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getPublicOffers, getBusinesses } from '../../api/offers';
import type { Offer, Business } from '../../types';
import OfferCard from '../../components/OfferCard';

const CATEGORIES = ['All', 'Food', 'Fitness', 'Beauty', 'Travel', 'Entertainment', 'Shopping', 'Wellness', 'Education', 'Other'];

export default function PublicOfferList() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ businessType: '', category: '', date: '' });
  const [search, setSearch] = useState('');

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.businessType) params.businessType = filters.businessType;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.date) params.date = filters.date;
      const data = await getPublicOffers(params);
      setOffers(data);
    } catch {
      toast.error('Failed to load offers.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);
  useEffect(() => { getBusinesses().then(setBusinesses).catch(() => {}); }, []);

  const businessTypes = [...new Set(businesses.map(b => b.businessType))];

  const filtered = offers.filter(o =>
    !search || o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.business?.name.toLowerCase().includes(search.toLowerCase())
  );

  const clearFilters = () => {
    setFilters({ businessType: '', category: '', date: '' });
    setSearch('');
  };

  const activeFilterCount = [filters.businessType, filters.category && filters.category !== 'All' ? filters.category : '', filters.date].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-16 animate-slide-up">
        <h1 className="font-display font-black text-5xl text-slate-100 tracking-tight leading-tight">
          Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Offers</span>
        </h1>
        <p className="text-slate-400 mt-3 text-lg max-w-xl mx-auto">
          Browse hand-picked deals from top businesses near you. Book your slot now.
        </p>

        {/* Highlight Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
          <div className="stat-card bg-dark-800/40">
            <span className="text-4xl mb-1">🎁</span>
            <span className="text-3xl font-black text-brand-500">{offers.length}</span>
            <span className="text-sm font-semibold text-slate-300">Active Offers Available</span>
            <span className="text-xs text-slate-500">Updated in real-time</span>
          </div>
          <div className="stat-card bg-dark-800/40">
            <span className="text-4xl mb-1">🏢</span>
            <span className="text-3xl font-black text-brand-500">{businesses.length}</span>
            <span className="text-sm font-semibold text-slate-300">Partner Businesses</span>
            <span className="text-xs text-slate-500">Salons, bistros, gyms & more</span>
          </div>
          <div className="stat-card bg-dark-800/40">
            <span className="text-4xl mb-1">⚡</span>
            <span className="text-3xl font-black text-brand-500">Up to 80%</span>
            <span className="text-sm font-semibold text-slate-300">Instant Discounts</span>
            <span className="text-xs text-slate-500">Guaranteed lowest pricing</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Title */}
      <div className="mb-6">
        <h2 className="font-display font-black text-2xl text-slate-100">Browse Available Promotions</h2>
        <p className="text-slate-400 text-sm">Find deals by business type, category, or date.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input
          type="text"
          placeholder="Search offers or businesses…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field py-3.5 text-base"
          style={{ paddingLeft: '2.75rem' }}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        {/* Business Type */}
        <select
          value={filters.businessType}
          onChange={e => setFilters(p => ({ ...p, businessType: e.target.value }))}
          className="bg-dark-800 border border-dark-600 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="">All Business Types</option>
          {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Date */}
        <input
          type="date"
          value={filters.date}
          onChange={e => setFilters(p => ({ ...p, date: e.target.value }))}
          className="bg-dark-800 border border-dark-600 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 cursor-pointer"
        />

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilters(p => ({ ...p, category: cat === 'All' ? '' : cat }))}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-0.5 ${
                (filters.category === cat) || (cat === 'All' && !filters.category)
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-dark-800 border border-dark-600 text-slate-400 hover:border-brand-500 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 ml-auto flex items-center gap-1 font-semibold transition-colors">
            ✕ Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-slate-500 text-sm font-semibold">
          {loading ? 'Loading…' : `${filtered.length} offer${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-64">
              <div className="h-4 bg-dark-600 rounded-full w-1/3 mb-4" />
              <div className="h-6 bg-dark-600 rounded-full w-2/3 mb-2" />
              <div className="h-6 bg-dark-600 rounded-full w-2/3 mb-2" />
              <div className="h-4 bg-dark-700 rounded-full w-1/2 mb-6" />
              <div className="h-8 bg-dark-600 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 card max-w-xl mx-auto border-dashed">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="font-display font-bold text-2xl text-slate-100 mb-2">No offers found</h3>
          <p className="text-slate-400">Try adjusting your filters or check back soon.</p>
          <button onClick={clearFilters} className="btn-primary mt-6">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(offer => (
            <OfferCard key={offer.id} offer={offer} showBookButton />
          ))}
        </div>
      )}

      {/* Featured Partner Businesses Directory */}
      {businesses.length > 0 && (
        <div className="mt-20 pt-12 border-t border-dark-600/60">
          <div className="mb-8">
            <h2 className="font-display font-black text-3xl text-slate-100">Featured Local Partners</h2>
            <p className="text-slate-400 mt-1">Trusted local businesses providing top-tier booking deals.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(b => (
              <div key={b.id} className="card bg-dark-800/40 hover:bg-dark-800 flex flex-col justify-between hover:shadow-brand-500/10 hover:border-brand-500">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-500 dark:text-brand-300">
                      {b.businessType}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">📍 {b.city}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-100 mb-2">{b.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{b.address}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-dark-700/50 flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>🕒 {b.openingTime} - {b.closingTime}</span>
                  <span>📞 {b.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
