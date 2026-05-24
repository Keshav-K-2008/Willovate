import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDashboardSummary, updateBookingStatus, getAllOffersAdmin, deleteOffer, deleteBooking } from '../../api/offers';
import type { DashboardSummary, Offer } from '../../types';
import StatusBadge from '../../components/StatusBadge';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  accent?: string;
  sub?: string;
}

function StatCard({ label, value, icon, accent = 'text-brand-400', sub }: StatCardProps) {
  return (
    <div className="stat-card group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`font-display font-black text-3xl ${accent}`}>{value}</span>
      </div>
      <p className="text-slate-300 font-semibold text-sm">{label}</p>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'offers'>('bookings');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [summaryData, offersData] = await Promise.all([
        getDashboardSummary(),
        getAllOffersAdmin()
      ]);
      setSummary(summaryData);
      setOffers(offersData);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast.success('Booking status updated.');
      fetchData();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this offer? This will delete all associated slots and bookings.')) return;
    try {
      await deleteOffer(id);
      toast.success('Offer deleted successfully.');
      fetchData();
    } catch {
      toast.error('Failed to delete offer.');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await deleteBooking(id);
      toast.success('Booking deleted successfully.');
      fetchData();
    } catch {
      toast.error('Failed to delete booking.');
    }
  };

  const capacityPct = summary && summary.totalCapacity > 0
    ? Math.round((summary.totalBooked / summary.totalCapacity) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display font-black text-4xl text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your booking system</p>
        </div>
        <Link to="/admin/offers/create" className="btn-primary">
          + New Offer
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Offers" value={summary?.totalOffers ?? 0} icon="🎁" />
        <StatCard label="Active Offers" value={summary?.activeOffers ?? 0} icon="✅" accent="text-emerald-400" />
        <StatCard label="Total Bookings" value={summary?.totalBookings ?? 0} icon="📋" accent="text-blue-400" />
        <StatCard label="Confirmed" value={summary?.confirmedBookings ?? 0} icon="🎫" accent="text-purple-400" />
      </div>

      {/* Capacity Row */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-slate-100">Capacity Overview</h2>
          <span className="text-2xl font-display font-black text-brand-400">{capacityPct}%</span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
            style={{ width: `${capacityPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-sm text-slate-400">
          <span>Booked: <span className="text-slate-100 font-semibold">{summary?.totalBooked}</span></span>
          <span>Total slots: <span className="text-slate-100 font-semibold">{summary?.totalSlots}</span></span>
          <span>Capacity: <span className="text-slate-100 font-semibold">{summary?.totalCapacity}</span></span>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-6 border-b border-dark-600 mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'bookings'
              ? 'text-brand-400 border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bookings Management
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'offers'
              ? 'text-brand-400 border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Offers Management ({offers.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'bookings' ? (
        /* Recent Bookings Table */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-slate-100">Recent Bookings</h2>
            <span className="text-xs text-slate-500">Last 10</span>
          </div>

          {!summary?.recentBookings.length ? (
            <div className="text-center py-12 text-slate-500">
              <div className="text-4xl mb-3">📭</div>
              <p>No bookings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    {['Ref #', 'Customer', 'Offer', 'Business', 'People', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {summary.recentBookings.map((b) => (
                    <tr key={b.id} className="group hover:bg-dark-700/50 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-brand-400 bg-brand-900 px-2 py-1 rounded">
                          {b.bookingReference}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-200 font-medium">{b.customerName}</td>
                      <td className="py-3 pr-4 text-sm text-slate-400 max-w-[160px] truncate">{b.offerTitle}</td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{b.businessName}</td>
                      <td className="py-3 pr-4 text-sm text-slate-300">{b.peopleCount}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 flex items-center gap-3">
                        <select
                          className="bg-dark-700 border border-dark-500 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-brand-500 cursor-pointer"
                          defaultValue={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        >
                          {['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="text-red-400 hover:text-red-300 hover:scale-110 active:scale-95 transition-all p-1.5 bg-red-950/20 rounded-lg border border-red-500/10 hover:border-red-500/30"
                          title="Delete Booking"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Offers Management Table */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-slate-100">All Offers</h2>
            <Link to="/admin/offers/create" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              + Create Offer
            </Link>
          </div>

          {!offers.length ? (
            <div className="text-center py-12 text-slate-500">
              <div className="text-4xl mb-3">🎁</div>
              <p>No offers created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    {['Offer Details', 'Business', 'Price', 'Discount', 'Dates', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {offers.map((o) => (
                    <tr key={o.id} className="group hover:bg-dark-700/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="text-sm font-semibold text-slate-200">{o.title}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[180px]">{o.category}</div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{o.business?.name || 'N/A'}</td>
                      <td className="py-3 pr-4 text-sm text-slate-300">₹{o.offerPrice}</td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-medium border border-emerald-500/20">
                          {o.discountPercentage.toFixed(0)}% OFF
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-400">
                        <div>Start: {o.startDate}</div>
                        <div>End: {o.endDate}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteOffer(o.id)}
                          className="text-red-400 hover:text-red-300 hover:scale-110 active:scale-95 transition-all p-1.5 bg-red-950/20 rounded-lg border border-red-500/10 hover:border-red-500/30"
                          title="Delete Offer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
