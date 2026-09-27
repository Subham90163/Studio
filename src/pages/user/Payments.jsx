import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { IndianRupee } from 'lucide-react';

const STATUS_COLORS = {
  Paid:    'bg-green-500/10 text-green-400 border border-green-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Failed:  'bg-red-500/10 text-red-400 border border-red-500/20',
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments')
      .then(res => {
        const d = res.data?.data ?? res.data;
        setPayments(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total   = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const paid    = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount ?? 0), 0);
  const pending = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-3xl font-display font-semibold mb-2">Payment History</h1>
      <p className="text-white/60 text-sm mb-8">All financial transactions and bills in Indian Rupees (₹).</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 border-l-4 border-l-white/20">
          <div className="text-white/50 text-sm mb-1">Total Billed</div>
          <div className="text-3xl font-semibold">
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-green-500/50">
          <div className="text-white/50 text-sm mb-1">Amount Paid</div>
          <div className="text-3xl font-semibold text-green-400">
            ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-amber-500/50">
          <div className="text-white/50 text-sm mb-1">Amount Pending</div>
          <div className="text-3xl font-semibold text-amber-400">
            ₹{pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Booking Ref', 'Amount (₹)', 'Payment Status', 'Date'].map(h => (
                  <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-white/50">Loading…</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-white/50">No payments found.</td></tr>
              ) : payments.map(p => (
                <tr key={p._id ?? p.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-sm text-white/70">{(p.bookingId ?? '').slice(-10) || 'Direct'}</td>
                  <td className="p-4 font-semibold text-amber-400">
                    ₹{Number(p.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-white/10 text-white'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-white/60 text-sm">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;