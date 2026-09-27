import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Check, AlertCircle, Clock, Calendar, ShieldCheck, IndianRupee } from 'lucide-react';

const STEPS = ['Select Services', 'Select Studio', 'Date & Timing', 'Review & Confirm'];

const PRESET_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const Book = () => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [studios, setStudios] = useState([]);
  
  // Selected state
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedStudioId, setSelectedStudioId] = useState(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/services')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(console.error);

    api.get('/studios')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setStudios(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
  }, []);

  const toggleService = (id) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const selectedStudio = studios.find(s => (s._id ?? s.id) === selectedStudioId);
  const selectedServices = services.filter(s => selectedServiceIds.includes(s._id ?? s.id));

  // Compute duration in hours
  const durationHours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    if (isNaN(startH) || isNaN(endH)) return 0;
    const diff = (endH + (endM || 0) / 60) - (startH + (startM || 0) / 60);
    return diff > 0 ? diff : 0;
  }, [startTime, endTime]);

  // Compute breakdown costs
  const studioTotal = useMemo(() => {
    if (!selectedStudio) return 0;
    const rate = selectedStudio.price ?? 0;
    return durationHours > 0 ? rate * durationHours : rate; // default 1 hr rate if timing not yet set
  }, [selectedStudio, durationHours]);

  const servicesBreakdown = useMemo(() => {
    return selectedServices.map(svc => {
      const isPerHour = svc.priceType === 'PerHour';
      const cost = isPerHour
        ? (durationHours > 0 ? svc.price * durationHours : svc.price)
        : (svc.price || 0);
      return {
        ...svc,
        isPerHour,
        effectiveCost: cost
      };
    });
  }, [selectedServices, durationHours]);

  const servicesTotal = useMemo(() => {
    return servicesBreakdown.reduce((sum, s) => sum + s.effectiveCost, 0);
  }, [servicesBreakdown]);

  const grandTotal = useMemo(() => {
    return (selectedStudio ? (durationHours > 0 ? selectedStudio.price * durationHours : 0) : 0) +
      servicesBreakdown.reduce((sum, s) => {
        return sum + (s.isPerHour && durationHours > 0 ? s.price * durationHours : (!s.isPerHour ? s.price : 0));
      }, 0);
  }, [selectedStudio, durationHours, servicesBreakdown]);

  const handleNext = () => {
    setError('');
    setStep(s => Math.min(s + 1, 4));
  };
  const handlePrev = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/bookings', {
        serviceIds: selectedServiceIds,
        serviceId: selectedServiceIds[0] || null,
        studioId: selectedStudioId,
        date: date,
        startTime: startTime,
        endTime: endTime,
      });
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return selectedServiceIds.length > 0;
    if (step === 2) return !!selectedStudioId;
    if (step === 3) return date && startTime && endTime && endTime > startTime;
    return true;
  };

  if (success) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4">
        <div className="glass-card text-center max-w-md w-full p-12">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mx-auto mb-6">
            <Check size={32} />
          </div>
          <h2 className="font-display text-2xl mb-3">Booking Confirmed!</h2>
          <p className="text-white/60 mb-2">Your session has been scheduled successfully.</p>
          <p className="text-amber-400 text-sm font-mono">Redirecting to My Bookings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-semibold mb-2">Book a Session</h1>
        <p className="text-white/60">Choose your services, reserve a studio, and set custom timings.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-12">
        {STEPS.map((label, idx) => {
          const s = idx + 1;
          const isActive = step === s;
          const isDone = step > s;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors text-sm ${
                  isDone ? 'bg-amber-500 text-black font-semibold' :
                  isActive ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-400 font-semibold' :
                  'bg-white/5 border border-white/20 text-white/40'
                }`}>
                  {isDone ? <Check size={18} /> : s}
                </div>
                <span className={`mt-2 text-xs uppercase tracking-wider hidden md:block ${isActive ? 'text-amber-400 font-medium' : 'text-white/40'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-colors ${isDone ? 'bg-amber-500/60' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Step Form */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 min-h-[420px] flex flex-col justify-between">
          <div>
            {/* Step 1 – Select Multiple Services */}
            {step === 1 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Step 1: Choose Services</h2>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                    {selectedServiceIds.length} Selected
                  </span>
                </div>
                <p className="text-white/50 text-sm mb-6">Select one or more services to add to your session booking:</p>

                {services.length === 0 ? (
                  <p className="text-white/50">Loading services…</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map(s => {
                      const id = s._id ?? s.id;
                      const active = selectedServiceIds.includes(id);
                      const isPerHour = s.priceType === 'PerHour';
                      return (
                        <div
                          key={id}
                          onClick={() => toggleService(id)}
                          className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            active
                              ? 'bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/5 ring-1 ring-amber-400'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-base text-white">{s.name}</span>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                                active ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/30'
                              }`}>
                                {active && <Check size={14} className="stroke-[3]" />}
                              </div>
                            </div>
                            <p className="text-white/60 text-xs mt-2 line-clamp-2">{s.description}</p>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                            <span className="text-amber-400 font-semibold text-sm">
                              ₹{s.price}{isPerHour ? '/hr' : ''}
                            </span>
                            <span className="text-xs text-white/40">
                              {isPerHour ? 'Hourly Rate' : 'Fixed'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 2 – Studio Selection */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Step 2: Select a Studio</h2>
                <p className="text-white/50 text-sm mb-6">Choose the studio environment for your production:</p>
                
                {studios.length === 0 ? (
                  <p className="text-white/50">Loading studios…</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {studios.map(s => {
                      const id = s._id ?? s.id;
                      const active = selectedStudioId === id;
                      return (
                        <div
                          key={id}
                          onClick={() => setSelectedStudioId(id)}
                          className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            active
                              ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div>
                            {s.image && (
                              <div className="h-28 rounded-lg overflow-hidden mb-3 bg-white/5">
                                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="text-base font-semibold text-white">{s.name}</div>
                            <div className="text-white/60 mt-1 text-xs">Capacity: up to {s.capacity} persons</div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-between items-center">
                            <span className="text-amber-400 font-semibold text-sm">₹{s.price}/hr</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${active ? 'bg-amber-400 text-black font-medium' : 'text-white/40'}`}>
                              {active ? 'Selected' : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3 – Timing Sheet (Custom Input + Quick Selector) */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Step 3: Date &amp; Time Selection</h2>
                <p className="text-white/50 text-sm mb-6">Type or pick your session date and start/end timings:</p>

                <div className="space-y-6">
                  {/* Date Input */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-amber-400" /> Booking Date
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>

                  {/* Manual Type / Time Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2 flex items-center gap-2">
                        <Clock size={16} className="text-amber-400" /> Start Time (Type or Pick)
                      </label>
                      <input
                        type="time"
                        className="input-field"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        placeholder="HH:MM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2 flex items-center gap-2">
                        <Clock size={16} className="text-amber-400" /> End Time (Type or Pick)
                      </label>
                      <input
                        type="time"
                        className="input-field"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        placeholder="HH:MM"
                      />
                    </div>
                  </div>

                  {/* Quick Timing Selection Sheet */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-3">
                      Quick Time Selection Sheet (Click to populate Start Time):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TIMES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setStartTime(t);
                            // Auto suggest 2 hour session if not set
                            const [h] = t.split(':').map(Number);
                            const endH = String(Math.min(h + 2, 23)).padStart(2, '0');
                            setEndTime(`${endH}:00`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                            startTime === t
                              ? 'bg-amber-500 text-black border-amber-500 font-semibold'
                              : 'bg-white/5 text-white/70 border-white/10 hover:border-amber-400/50 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Validation warning */}
                  {startTime && endTime && endTime <= startTime && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> End time must be strictly after start time.
                    </div>
                  )}

                  {durationHours > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-lg text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock size={16} /> Total Session Duration:
                      </span>
                      <span className="font-semibold text-white">{durationHours} Hours</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4 – Confirm */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-center">Confirm Your Reservation</h2>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between border-b border-white/10 pb-2 text-sm">
                    <span className="text-white/60">Selected Studio:</span>
                    <span className="font-medium text-white">{selectedStudio?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2 text-sm">
                    <span className="text-white/60">Scheduled Date:</span>
                    <span className="font-medium text-white">{date || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2 text-sm">
                    <span className="text-white/60">Session Time:</span>
                    <span className="font-medium text-white">{startTime} to {endTime} ({durationHours} hr)</span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm block mb-1">Services Included:</span>
                    <div className="space-y-1 pl-2">
                      {servicesBreakdown.map(s => (
                        <div key={s._id ?? s.id} className="flex justify-between text-xs text-white/80">
                          <span>• {s.name} ({s.isPerHour ? `₹${s.price}/hr × ${durationHours}h` : 'Fixed'})</span>
                          <span className="font-mono text-amber-400">₹{s.effectiveCost.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handlePrev}
              className={`btn-outline ${step === 1 ? 'invisible' : ''}`}
            >
              Back
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn-primary disabled:opacity-40 flex items-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" /> Confirming…</>
                ) : (
                  <>Confirm &amp; Book Now</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Live Total Cost Summary Card (Visible on all steps before booking) */}
        <div className="glass-card p-6 h-fit sticky top-28 border border-amber-500/20 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <IndianRupee className="text-amber-400" size={20} />
            <h3 className="font-semibold text-lg">Total Cost Estimate</h3>
          </div>

          <div className="space-y-3 text-sm">
            {/* Studio Cost Row */}
            <div className="flex justify-between items-center text-white/70">
              <span>Studio Rental:</span>
              <span className="font-mono font-medium text-white">
                {selectedStudio
                  ? `₹${(selectedStudio.price * (durationHours > 0 ? durationHours : 1)).toLocaleString('en-IN')}`
                  : '₹0'}
              </span>
            </div>
            {selectedStudio && (
              <div className="text-xs text-white/40 pl-2">
                ₹{selectedStudio.price}/hr {durationHours > 0 ? `× ${durationHours} hrs` : '(1 hr base)'}
              </div>
            )}

            {/* Services Cost Row */}
            <div className="flex justify-between items-center text-white/70 pt-2 border-t border-white/[0.06]">
              <span>Services ({selectedServices.length}):</span>
              <span className="font-mono font-medium text-white">
                ₹{servicesTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Services itemized */}
            {servicesBreakdown.length > 0 && (
              <div className="space-y-1 pl-2">
                {servicesBreakdown.map(s => (
                  <div key={s._id ?? s.id} className="flex justify-between text-xs text-white/50">
                    <span className="truncate max-w-[140px]">{s.name}</span>
                    <span className="font-mono">₹{s.effectiveCost.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
              <span className="font-semibold text-base text-white">Total Amount:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400 font-mono">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-white/40">Includes all taxes &amp; fees</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/50 flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-400 shrink-0" />
            <span>Pay on arrival or via Admin confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;