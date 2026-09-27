import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Calendar, Clock, MapPin, Sparkles, XCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
  Confirmed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [cancelModalId, setCancelModalId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/bookings')
      .then(res => {
        const d = res.data?.data ?? res.data;
        setBookings(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalId) return;
    const id = cancelModalId;
    setCancelling(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      setCancelModalId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = bookings.filter(b => {
    if (activeTab === 'upcoming')   return b.status === 'Pending' || b.status === 'Confirmed';
    if (activeTab === 'completed')  return b.status === 'Completed';
    return b.status === 'Cancelled';
  });

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold">My Bookings</h1>
          <p className="text-white/60 text-sm mt-1">View your scheduled studio sessions, services included, and booking status.</p>
        </div>
        <Link to="/book" className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <span>+ Book New Session</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl w-fit">
        {['upcoming', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="glass-card h-28 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card text-white/50">
          No {activeTab} bookings found.
          {activeTab === 'upcoming' && (
            <div className="mt-4">
              <Link to="/book" className="text-amber-400 hover:underline">Book a session now →</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map(b => {
            const id = b._id ?? b.id;
            const servicesList = b.servicesBooked || (b.serviceName ? [b.serviceName] : []);
            return (
              <div key={id} className="glass-card flex flex-col lg:flex-row justify-between lg:items-center gap-6 p-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">
                      {b.studioName || `Booking #${id?.slice(-6)}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-white/10 text-white'}`}>
                      {b.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                      b.paymentStatus === 'Paid'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      Payment: {b.paymentStatus || 'Pending'}
                    </span>
                  </div>

                  {/* Booking Date & Timing Info */}
                  <div className="text-white/70 text-sm flex flex-wrap gap-4 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-400" />
                      {b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" />
                      {b.startTime} – {b.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-white/50 text-xs font-mono">
                      Ref: {id?.slice(-8)}
                    </span>
                  </div>

                  {/* Services Booked Summary */}
                  {servicesList.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/50 flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-400" /> Services:
                      </span>
                      {servicesList.map((s, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-xs text-white/80">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount & Actions */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 min-w-[160px]">
                  <div className="text-right">
                    <div className="text-xs text-white/40">Total Amount</div>
                    <div className="text-2xl font-bold text-amber-400 font-mono">
                      ₹{Number(b.totalAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Cancel Booking Option */}
                  {(b.status === 'Pending' || b.status === 'Confirmed') && (
                    <button
                      onClick={() => setCancelModalId(id)}
                      disabled={cancelling === id}
                      className="mt-3 text-sm text-red-400 hover:text-red-300 px-3.5 py-1.5 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <XCircle size={15} />
                      <span>Cancel Booking</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to Cancel */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card max-w-sm w-full p-6 text-center border border-red-500/30">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Cancel This Booking?</h3>
            <p className="text-white/60 text-sm mb-6">
              Are you sure you want to cancel booking #{cancelModalId.slice(-6)}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalId(null)}
                className="btn-outline flex-1 py-2 text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling === cancelModalId}
                className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-4 py-2 text-sm flex-1 transition-colors disabled:opacity-50"
              >
                {cancelling === cancelModalId ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;