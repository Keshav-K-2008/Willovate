import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../../api/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', nextTheme);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
          >
            ← Back to Home
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition-colors text-base"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 mb-5 shadow-lg shadow-brand-900/50">
            <span className="text-white font-display font-black text-2xl">S</span>
          </div>
          <h1 className="font-display font-black text-3xl text-slate-100 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            SmartOffer Slot Booking System
          </p>
        </div>

        {/* Card */}
        <div className="card border-dark-600 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="sample@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
