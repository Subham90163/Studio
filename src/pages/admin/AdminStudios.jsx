import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, X, Edit2 } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', image: '', capacity: '', price: '', isActive: true };

const AdminStudios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/studios')
      .then(res => {
        const d = res.data?.data ?? res.data;
        setStudios(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, description: s.description, image: s.image || '', capacity: s.capacity, price: s.price, isActive: s.isActive }); setError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, capacity: Number(form.capacity), price: Number(form.price) };
      if (editing) {
        await api.put(`/admin/studios/${editing._id ?? editing.id}`, payload);
      } else {
        await api.post('/admin/studios', payload);
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
    if (!confirm('Delete this studio?')) return;
    try {
      await api.delete(`/admin/studios/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Manage Studios</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2">
          <Plus size={18} /><span>Add Studio</span>
        </button>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Image', 'Name', 'Capacity', 'Rate/hr', 'Active', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">Loading…</td></tr>
              ) : studios.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">No studios yet.</td></tr>
              ) : studios.map(s => (
                <tr key={s._id ?? s.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="w-16 h-10 rounded overflow-hidden bg-white/10">
                      {s.image && <img src={s.image} alt={s.name} className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 text-white/70">{s.capacity} pax</td>
                  <td className="p-4 font-semibold text-amber-400">₹{s.price}/hr</td>
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
              <h2 className="text-xl font-semibold">{editing ? 'Edit Studio' : 'Add Studio'}</h2>
              <button onClick={closeModal}><X size={20} className="text-white/60 hover:text-white" /></button>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Name" value={form.name} onChange={v => setForm({...form, name: v})} required />
              <Field label="Description" value={form.description} onChange={v => setForm({...form, description: v})} textarea />
              <Field label="Image URL" value={form.image} onChange={v => setForm({...form, image: v})} placeholder="https://..." />
              <div className="flex gap-4">
                <Field label="Capacity" value={form.capacity} onChange={v => setForm({...form, capacity: v})} type="number" required />
                <Field label="Price/hr (₹)" value={form.price} onChange={v => setForm({...form, price: v})} type="number" required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm text-white/70">Active</span>
              </label>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Studio' : 'Create Studio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', required, textarea, placeholder }) => (
  <div className="flex-1">
    <label className="block text-sm text-white/60 mb-1">{label}{required && ' *'}</label>
    {textarea
      ? <textarea rows="3" className="input-field resize-none" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      : <input type={type} className="input-field" value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />
    }
  </div>
);

export default AdminStudios;