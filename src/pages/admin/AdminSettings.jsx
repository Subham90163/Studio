import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const FIELDS = [
  { key: 'studioName', label: 'Studio Name', type: 'text' },
  { key: 'email', label: 'Contact Email', type: 'email' },
  { key: 'phone', label: 'Phone Number', type: 'tel' },
  { key: 'address', label: 'Address', type: 'textarea' },
];

const AdminSettings = () => {
  const [form, setForm] = useState({ studioName: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then(res => {
        const d = res.data?.data ?? res.data;
        if (d) setForm({ studioName: d.studioName ?? '', email: d.email ?? '', phone: d.phone ?? '', address: d.address ?? '' });
      })
      .catch(() => {/* settings might not exist yet */})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/admin/settings', form);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setMessage('Failed to save: ' + (err.response?.data?.message ?? err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold mb-8">System Settings</h1>

      <div className="glass-card p-8">
        <h2 className="text-xl font-medium mb-6 border-b border-white/10 pb-4">Studio Information</h2>

        {loading ? (
          <div className="py-8 text-center text-white/50">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FIELDS.filter(f => f.type !== 'textarea').map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-white/60 mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    className="input-field"
                    value={form[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Address</label>
              <textarea
                className="input-field resize-none"
                rows="3"
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.startsWith('Failed') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Configuration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;