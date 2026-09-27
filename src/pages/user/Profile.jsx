import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import { User, Mail, Phone, Lock, Check, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, login, token } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        const d = res.data?.data ?? res.data;
        if (d) {
          setFormData({
            name: d.name || '',
            email: d.email || '',
            phone: d.phone || '',
            password: '',
          });
        }
      })
      .catch(() => {
        // Fallback to auth context
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.phone.trim()) {
      setError('Phone number is mandatory.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.put('/auth/profile', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        password: formData.password || undefined,
      });

      const updated = res.data?.data ?? res.data;
      if (updated && login && token) {
        login(updated, token);
      }
      setSuccess('Profile updated successfully.');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-3xl font-display font-semibold mb-2">My Profile</h1>
      <p className="text-white/60 mb-8">Manage your account information and security.</p>

      <div className="glass-card p-8">
        {loading ? (
          <div className="py-8 text-center text-white/50">Loading profile…</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm flex items-center gap-2">
                <Check size={18} /> {success}
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field pl-10"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <User size={18} className="absolute left-3 top-3.5 text-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    className="input-field pl-10 bg-white/[0.02] text-white/50 cursor-not-allowed border-white/[0.05]"
                    value={formData.email}
                    readOnly
                  />
                  <Mail size={18} className="absolute left-3 top-3.5 text-white/30" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Phone Number <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="input-field pl-10"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <Phone size={18} className="absolute left-3 top-3.5 text-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">New Password (optional)</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Leave blank to keep current"
                    className="input-field pl-10"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Lock size={18} className="absolute left-3 top-3.5 text-white/40" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.08]">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;