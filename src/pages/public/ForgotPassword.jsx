import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, Phone, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        phone,
        newPassword
      });
      setSuccess(res.data?.message || 'Password has been reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your email and phone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 glass-card w-full max-w-md p-8 md:p-10 my-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-semibold mb-2 text-white">Reset Password</h2>
          <p className="text-white/60 text-sm">Enter your registered email and mandatory phone number to reset your password</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0" />
            <span>{success} Redirecting to login…</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Registered Email <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Mail size={18} className="absolute left-3 top-3.5 text-white/40" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Registered Phone Number <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                className="input-field pl-10"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <Phone size={18} className="absolute left-3 top-3.5 text-white/40" />
            </div>
            <p className="text-xs text-white/40 mt-1">Must match the phone number on your account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              New Password <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                className="input-field pl-10"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <Lock size={18} className="absolute left-3 top-3.5 text-white/40" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Confirm New Password <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                className="input-field pl-10"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <Lock size={18} className="absolute left-3 top-3.5 text-white/40" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
            ) : (
              'RESET PASSWORD'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
