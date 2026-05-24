import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createOffer, getBusinesses } from '../../api/offers';
import type { Business, OfferStatus } from '../../types';

const CATEGORIES = ['Food', 'Fitness', 'Beauty', 'Travel', 'Entertainment', 'Shopping', 'Wellness', 'Education', 'Other'];
const STATUSES: OfferStatus[] = ['Draft', 'Active', 'Paused'];

export default function CreateOffer() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    businessId: '',
    title: '',
    description: '',
    category: '',
    originalPrice: '',
    offerPrice: '',
    startDate: '',
    endDate: '',
    termsAndConditions: '',
    status: 'Draft' as OfferStatus,
  });

  useEffect(() => {
    getBusinesses().then(setBusinesses).catch(() => toast.error('Failed to load businesses.'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const discount = form.originalPrice && form.offerPrice
    ? Math.max(0, ((+form.originalPrice - +form.offerPrice) / +form.originalPrice) * 100).toFixed(1)
    : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.businessId) { toast.error('Please select a business.'); return; }
    if (+form.offerPrice >= +form.originalPrice) {
      toast.error('Offer price must be less than original price.');
      return;
    }
    setLoading(true);
    try {
      await createOffer({
        businessId: +form.businessId,
        title: form.title,
        description: form.description,
        category: form.category,
        originalPrice: +form.originalPrice,
        offerPrice: +form.offerPrice,
        startDate: form.startDate,
        endDate: form.endDate,
        termsAndConditions: form.termsAndConditions,
        status: form.status,
      });
      toast.success('Offer created successfully!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-300 mb-4 inline-flex items-center gap-1">
          ← Back
        </button>
        <h1 className="font-display font-black text-4xl text-slate-100 tracking-tight">Create New Offer</h1>
        <p className="text-slate-400 mt-2">Fill in the details below to publish an offer.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Business & Status */}
        <div className="card">
          <h2 className="font-display font-bold text-lg text-slate-100 mb-5">Offer Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Business *</label>
              <select name="businessId" value={form.businessId} onChange={handleChange} required className="input-field">
                <option value="">Select a business</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.businessType})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Offer Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="input-field" placeholder="e.g. Buy 1 Get 1 Free on All Mains" />
          </div>

          <div className="mt-4">
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="input-field resize-none" placeholder="Describe your offer…" />
          </div>

          <div className="mt-4">
            <label className="label">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required className="input-field">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <h2 className="font-display font-bold text-lg text-slate-100 mb-5">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Original Price (₹) *</label>
              <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange}
                required min={1} step="0.01" className="input-field" placeholder="999" />
            </div>
            <div>
              <label className="label">Offer Price (₹) *</label>
              <input type="number" name="offerPrice" value={form.offerPrice} onChange={handleChange}
                required min={1} step="0.01" className="input-field" placeholder="599" />
            </div>
          </div>
          {discount && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-brand-900/30 border border-brand-700/50 rounded-xl">
              <span className="text-brand-400 text-2xl font-display font-black">{discount}%</span>
              <span className="text-brand-300 text-sm">discount will be applied</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="card">
          <h2 className="font-display font-bold text-lg text-slate-100 mb-5">Offer Period</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                required className="input-field" />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
                required className="input-field" />
            </div>
          </div>
        </div>

        {/* T&C */}
        <div className="card">
          <h2 className="font-display font-bold text-lg text-slate-100 mb-5">Terms & Conditions</h2>
          <textarea name="termsAndConditions" value={form.termsAndConditions} onChange={handleChange} rows={4}
            className="input-field resize-none" placeholder="List any terms, restrictions or conditions…" />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>Creating…</>
            ) : 'Create Offer →'}
          </button>
        </div>
      </form>
    </div>
  );
}
