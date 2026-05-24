import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const user = JSON.parse(localStorage.getItem('auth_user') || 'null');

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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/admin/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">S</span>
            </div>
            <span className="font-display font-bold text-lg text-slate-100 tracking-tight">
              Smart<span className="text-brand-400">Offer</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition-colors mr-1 text-base"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {!isAdmin && (
              <>
                <Link to="/" className="btn-ghost text-sm">Browse Offers</Link>
                <Link
                  to="/admin/login"
                  className="ml-2 btn-primary text-sm py-2 px-4"
                >
                  Admin Portal
                </Link>
              </>
            )}

            {isAdmin && user && (
              <>
                <Link to="/admin/dashboard" className="btn-ghost text-sm">Dashboard</Link>
                <Link to="/admin/offers/create" className="btn-ghost text-sm">New Offer</Link>
                <div className="mx-3 h-5 w-px bg-dark-600" />
                <span className="text-slate-400 text-sm font-medium">{user.name}</span>
                <button onClick={handleLogout} className="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
