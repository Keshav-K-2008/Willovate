import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateOffer from './pages/admin/CreateOffer';
import PublicOfferList from './pages/public/PublicOfferList';
import BookingFlow from './pages/public/BookingFlow';

// Auth guard for admin routes
function ProtectedRoute() {
  const token = localStorage.getItem('auth_token');
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

// Layout with navbar
function Layout() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const root = window.document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a26',
            color: '#e2e8f0',
            border: '1px solid #2e2e44',
            fontFamily: "Arial, sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route index element={<PublicOfferList />} />
          <Route path="offers/:offerId/book" element={<BookingFlow />} />
        </Route>

        {/* Admin login (no navbar-based layout needed) */}
        <Route path="admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/offers/create" element={<CreateOffer />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
