import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import { Calendar, IndianRupee, Clock, ArrowRight } from 'lucide-react';

const STATUS_COLORS = {
  Confirmed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/payments'),
        ]);
        const b = bRes.data?.data ?? bRes.data ?? [];
        const p = pRes.data?.data ?? pRes.data ?? [];
        setBookings(Array.isArray(b) ? b : []);
        setPayments(Array.isArray(p) ? p : []);
      } catch {
        // User may not have any bookings yet
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const upcoming = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed');
  const nextBooking = upcoming[0];
  const remaining = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-semibold mb-1">Welcome back, {user?.name}</h1>
          <p className="text-white/60">Manage your sessions, bookings, and track payments in Indian Rupees (₹).</p>
        </div>
        <Link to="/book" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
          <span>+ Book a Session</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<Calendar size={24} />} color="blue" label="Upcoming Sessions" value={upcoming.length} />
        <StatCard
          icon={<Clock size={24} />}
          color="green"
          label="Next Scheduled Session"
          value={nextBooking ? `${nextBooking.date ? new Date(nextBooking.date).toLocaleDateString('en-IN') : ''} · ${nextBooking.startTime ?? ''}` : 'None'}
          small
        />
        <StatCard
          icon={<IndianRupee size={24} />}
          color="amber"
          label="Amount Pending (₹)"
          value={`₹${remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        />
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <Link to="/bookings" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
            <span>View All Bookings</span> <ArrowRight size={14} />
          </Link>
        </div>

        <div className="glass-card p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/50">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {['Studio / Service', 'Date', 'Time', 'Total (₹)', 'Booking Status', 'Action'].map(h => (
                      <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map(b => (
                    <tr key={b._id ?? b.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{b.studioName || 'Studio Space'}</div>
                        {b.servicesBooked && b.servicesBooked.length > 0 && (
                          <div className="text-xs text-white/50">{b.servicesBooked.join(', ')}</div>
                        )}
                      </td>
                      <td className="p-4 text-white/80">{b.date ? new Date(b.date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="p-4 text-white/70">{b.startTime} – {b.endTime}</td>
                      <td className="p-4 font-semibold text-amber-400">
                        ₹{Number(b.totalAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-white/10 text-white'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link to="/bookings" className="text-xs text-amber-400 hover:underline">
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-white/50">
                        No bookings yet. <Link to="/book" className="text-amber-400 hover:underline">Book a session now</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, label, value, small }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };
  return (
    <div className="glass-card flex items-center gap-4 p-6">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-white/50 text-sm mb-1">{label}</div>
        <div className={`font-semibold truncate ${small ? 'text-base' : 'text-2xl'}`}>{value}</div>
      </div>
    </div>
  );
};

export default Dashboard;