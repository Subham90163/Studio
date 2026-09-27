import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Lazy load pages
const Home = lazy(() => import('./pages/public/Home'));
const Services = lazy(() => import('./pages/public/Services'));
const Studios = lazy(() => import('./pages/public/Studios'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));

const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const Book = lazy(() => import('./pages/user/Book'));
const Bookings = lazy(() => import('./pages/user/Bookings'));
const Payments = lazy(() => import('./pages/user/Payments'));
const Profile = lazy(() => import('./pages/user/Profile'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminStudios = lazy(() => import('./pages/admin/AdminStudios'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-12 h-12 border-4 border-white/10 border-t-gold-400 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#f5f5f5] font-sans selection:bg-gold-400/30">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes with Navbar & Footer */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
          <Route path="/studios" element={<><Navbar /><Studios /><Footer /></>} />
          <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
          <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
          <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />

          {/* User Protected Routes with Navbar & Footer */}
          <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /><Footer /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute><Navbar /><Book /><Footer /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Navbar /><Bookings /><Footer /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Navbar /><Payments /><Footer /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /><Footer /></ProtectedRoute>} />

          {/* Admin Routes with AdminLayout */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="studios" element={<AdminStudios />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;