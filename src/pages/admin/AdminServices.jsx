import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, X, Edit2 } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', image: '', price: '', priceType: 'OneTime', duration: '', isActive: true };

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/services')
      .then(res => {
        const d = res.data?.data ?? res.data;
        setServices(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description,
      image: s.image || '',
      price: s.price,
      priceType: s.priceType || 'OneTime',
      duration: s.duration,
      isActive: s.isActive
    });
    setError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        priceType: form.priceType || 'OneTime'
      };
      if (editing) {
        await api.put(`/admin/services/${editing._id ?? editing.id}`, payload);
      } else {
        await api.post('/admin/services', payload);
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Manage Services</h1>
          <p className="text-white/60 text-sm mt-1">Configure services with One-Time or Per-Hour pricing in Indian Rupees (₹)</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2">
          <Plus size={18} /><span>Add Service</span>
        </button>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Name', 'Description', 'Price Model', 'Price (₹)', 'Duration', 'Active', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-white/50">Loading…</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-white/50">No services yet.</td></tr>
              ) : services.map(s => (
                <tr key={s._id ?? s.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 text-white/50 text-sm max-w-xs truncate">{s.description}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      s.priceType === 'PerHour' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {s.priceType === 'PerHour' ? 'Per Hour (/hr)' : 'One Time Flat'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-amber-400">
                    ₹{s.price}{s.priceType === 'PerHour' ? '/hr' : ''}
                  </td>
                  <td className="p-4 text-white/70">{s.duration} min</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${s.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-3">
                    <button onClick={() => openEdit(s)} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(s._id ?? s.id)} className="text-sm text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative glass-card w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={closeModal}><X size={20} className="text-white/60 hover:text-white" /></button>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Name *</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <textarea rows="3" className="input-field resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Image URL</label>
                <input type="text" className="input-field" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Pricing Model *</label>
                <select
                  className="input-field"
                  value={form.priceType}
                  onChange={e => setForm({ ...form, priceType: e.target.value })}
                >
                  <option value="OneTime">One-Time Fixed Price (₹ Flat)</option>
                  <option value="PerHour">Per Hour Price (₹ / hour)</option>
                </select>
                <p className="text-xs text-white/40 mt-1">
                  {form.priceType === 'PerHour' ? 'Calculated automatically based on hours selected by user.' : 'Applied once to the total session cost.'}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-white/60 mb-1">
                    {form.priceType === 'PerHour' ? 'Price/hr (₹) *' : 'Price (₹) *'}
                  </label>
                  <input type="number" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-white/60 mb-1">Estimated Duration (min) *</label>
                  <input type="number" className="input-field" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm text-white/70">Active</span>
              </label>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Service' : 'Create Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;