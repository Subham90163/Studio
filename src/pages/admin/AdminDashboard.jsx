import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Users, CalendarCheck, IndianRupee, AlertCircle, ArrowRight } from 'lucide-react';

const STATUS_COLORS = {
  Confirmed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Cancelled:  'bg-red-500/10 text-red-400 border border-red-500/20',
  Pending:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data?.data ?? res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Handle both camelCase and PascalCase
  const currentUsers = data?.currentUsers ?? data?.CurrentUsers ?? data?.totalUsers ?? data?.TotalUsers ?? 0;
  const totalUsers = data?.totalUsers ?? data?.TotalUsers ?? 0;
  const confirmedBookings = data?.confirmedBookings ?? data?.ConfirmedBookings ?? 0;
  const totalBookings = data?.totalBookings ?? data?.TotalBookings ?? 0;
  const totalRevenue = Number(data?.totalRevenue ?? data?.TotalRevenue ?? 0);
  const pendingRevenue = Number(data?.pendingRevenue ?? data?.PendingRevenue ?? 0);
  const pendingPayments = data?.pendingPayments ?? data?.PendingPayments ?? 0;
  const recentBookings = data?.recentBookings ?? data?.RecentBookings ?? [];

  const stats = [
    {
      title: 'Current Users',
      value: loading ? '…' : currentUsers,
      subtext: `Total: ${totalUsers} registered`,
      icon: <Users size={22} />,
      color: 'blue'
    },
    {
      title: 'Confirmed Bookings',
      value: loading ? '…' : confirmedBookings,
      subtext: `Total: ${totalBookings} bookings`,
      icon: <CalendarCheck size={22} />,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: loading ? '…' : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: 'Completed & Paid sessions',
      icon: <IndianRupee size={22} />,
      color: 'amber'
    },
    {
      title: 'Pending Payments',
      value: loading ? '…' : `${pendingPayments} pending`,
      subtext: `Unpaid: ₹${pendingRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <AlertCircle size={22} />,
      color: 'red'
    },
  ];

  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    amber: 'bg-amber-500/10 text-amber-400',
    red:   'bg-red-500/10 text-red-400',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
          <p className="text-white/60 text-sm mt-1">Live studio bookings, active users, and revenue tracking in Indian Rupees (₹)</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/bookings" className="btn-outline py-2 px-4 text-sm flex items-center gap-1.5">
            Bookings <ArrowRight size={14} />
          </Link>
          <Link to="/admin/users" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
            Users <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(stat => (
          <div key={stat.title} className="glass-card p-6 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[stat.color]}`}>
              {stat.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white/50 text-sm mb-1">{stat.title}</div>
              <div className="text-2xl font-semibold truncate">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <p className="text-xs text-white/50">Latest customer studio bookings and payment states</p>
          </div>
          <Link to="/admin/bookings" className="text-sm text-amber-400 hover:text-amber-300">View All Bookings</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                {['User', 'Studio', 'Date & Time', 'Amount (₹)', 'Booking Status', 'Payment'].map(h => (
                  <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">Loading live data…</td></tr>
              ) : recentBookings.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">No bookings yet.</td></tr>
              ) : (
                recentBookings.map(b => (
                  <tr key={b.id ?? b._id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-sm text-white">{b.userName || 'Client'}</div>
                      <div className="text-xs text-white/50 font-mono">{b.userEmail || (b.userId ?? '').slice(-8)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-white/90">{b.studioName || 'Studio Space'}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="text-white/80">{b.date?.split('T')[0] ?? '—'}</div>
                      <div className="text-xs text-white/50">{b.startTime} - {b.endTime}</div>
                    </td>
                    <td className="p-4 font-semibold text-amber-400">
                      ₹{Number(b.totalAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-white/10 text-white'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                        b.paymentStatus === 'Paid'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {b.paymentStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;