import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { IndianRupee, Check } from 'lucide-react';

const STATUS_COLORS = {
  Paid:    'bg-green-500/10 text-green-400 border border-green-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Failed:  'bg-red-500/10 text-red-400 border border-red-500/20',
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/payments')
      .then(res => {
        const d = res.data?.data ?? res.data;
        setPayments(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkPaid = async (id) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/payments/${id}/mark-paid`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const total    = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const paid     = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount ?? 0), 0);
  const pending  = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Payments (INR ₹)</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Billed', value: total, color: 'text-white' },
          { label: 'Total Paid', value: paid, color: 'text-green-400' },
          { label: 'Pending', value: pending, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <IndianRupee size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="text-white/50 text-sm mb-1">{s.label}</div>
              <div className={`text-2xl font-semibold ${s.color}`}>
                ₹{s.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Booking Ref', 'User ID', 'Amount (₹)', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">Loading…</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">No payments yet.</td></tr>
              ) : payments.map(p => {
                const pId = p._id ?? p.id;
                return (
                  <tr key={pId} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-xs text-white/60">{(p.bookingId ?? '').slice(-10)}</td>
                    <td className="p-4 font-mono text-xs text-white/60">{(p.userId ?? '').slice(-10)}</td>
                    <td className="p-4 font-semibold text-amber-400">
                      ₹{Number(p.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-white/10 text-white'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-white/60 text-sm">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="p-4">
                      {p.status === 'Pending' ? (
                        <button
                          onClick={() => handleMarkPaid(pId)}
                          disabled={updatingId === pId}
                          className="btn-primary text-xs py-1 px-3 flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check size={12} /> {updatingId === pId ? '…' : 'Mark Paid'}
                        </button>
                      ) : (
                        <span className="text-xs text-green-400/80">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;