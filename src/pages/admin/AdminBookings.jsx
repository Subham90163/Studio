import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUS_COLORS = {
  Confirmed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Cancelled:  'bg-red-500/10 text-red-400 border border-red-500/20',
  Pending:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/admin/bookings')
      .then(res => {
        const d = res.data?.data ?? res.data;
        setBookings(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/admin/bookings/${id}/${action}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status?.toLowerCase() === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-semibold">All Bookings</h1>
        <select
          className="input-field py-2 w-full sm:w-48"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['User', 'Studio', 'Date', 'Time', 'Amount (₹)', 'Status', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-white/50">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-white/50">No bookings found.</td></tr>
              ) : filtered.map(b => (
                <tr key={b._id ?? b.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-white/60">{(b.userId ?? '').slice(-8)}</td>
                  <td className="p-4 font-mono text-xs text-white/60">{(b.studioId ?? '').slice(-8)}</td>
                  <td className="p-4 text-sm">{b.date?.split('T')[0] ?? '—'}</td>
                  <td className="p-4 text-sm text-white/70">{b.startTime} – {b.endTime}</td>
                  <td className="p-4 font-semibold text-amber-400">
                    {b.totalAmount != null ? `₹${Number(b.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-white/10 text-white'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {b.status === 'Pending' && (
                        <button
                          onClick={() => handleAction(b._id ?? b.id, 'confirm')}
                          className="text-xs px-3 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >Confirm</button>
                      )}
                      {(b.status === 'Pending' || b.status === 'Confirmed') && (
                        <button
                          onClick={() => handleAction(b._id ?? b.id, 'cancel')}
                          className="text-xs px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >Cancel</button>
                      )}
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => handleAction(b._id ?? b.id, 'complete')}
                          className="text-xs px-3 py-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                        >Complete</button>
                      )}
                    </div>
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

export default AdminBookings;