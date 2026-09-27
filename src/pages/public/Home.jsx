import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [services, setServices] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingStudios, setLoadingStudios] = useState(true);

  // Parallax on hero image
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (heroRef.current) {
            const scrolled = window.scrollY;
            heroRef.current.style.transform = `translateY(${scrolled * 0.4}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch services
  useEffect(() => {
    api.get('/services')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  // Fetch studios
  useEffect(() => {
    api.get('/studios')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setStudios(Array.isArray(data) ? data : []);
      })
      .catch(() => setStudios([]))
      .finally(() => setLoadingStudios(false));
  }, []);

  const statusColor = (status) => {
    if (!status) return 'bg-white/10 text-white';
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  return (
    <div className="w-full">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div
            ref={heroRef}
            className="absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center parallax-section"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl" style={{ animation: 'fadeIn 1s ease-out' }}>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider leading-tight mb-6 text-white">
            CREATE.<br />CAPTURE.<br />DELIVER.
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 font-light">
            A creative space for your next story.
          </p>
          <button
            onClick={() => navigate('/book')}
            className="btn-primary text-lg px-8 py-4 uppercase tracking-widest inline-flex items-center gap-2"
          >
            <span>Book Now</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* ── Services ─────────────────────────────────────── */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl text-white mb-4">OUR SERVICES</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto" />
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card h-72 animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-white/50">No services found. Add some from the admin panel.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div
                key={svc.id ?? svc._id}
                className="glass-card overflow-hidden group p-0 pb-6 transition-transform hover:scale-[1.02]"
              >
                <div className="h-48 overflow-hidden mb-6">
                  <img
                    src={svc.image || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80'}
                    alt={svc.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="px-6">
                  <h3 className="text-xl font-semibold mb-2">{svc.name}</h3>
                  <p className="text-white/60 mb-4 text-sm">{svc.description}</p>
                  <div className="text-amber-400 font-medium">₹{svc.price} starting</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Studios ──────────────────────────────────────── */}
      <section id="studios" className="py-24 bg-white/[0.02] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-white mb-4">OUR STUDIOS</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto" />
          </div>

          {loadingStudios ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[1,2].map(i => <div key={i} className="glass rounded-2xl h-64 animate-pulse" />)}
            </div>
          ) : studios.length === 0 ? (
            <p className="text-center text-white/50">No studios found. Add some from the admin panel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {studios.map((studio) => (
                <div
                  key={studio.id ?? studio._id}
                  className="glass rounded-2xl overflow-hidden flex flex-col sm:flex-row group transition-all hover:border-white/20"
                >
                  <div className="sm:w-2/5 h-64 sm:h-auto overflow-hidden">
                    <img
                      src={studio.image || 'https://images.unsplash.com/photo-1621784563330-caee0b138a00?w=600&q=80'}
                      alt={studio.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8 sm:w-3/5 flex flex-col justify-center">
                    <h3 className="text-2xl font-display font-semibold mb-2">{studio.name}</h3>
                    <div className="flex gap-4 mb-6 text-sm text-white/60">
                      <span>Up to {studio.capacity} people</span>
                      <span>•</span>
                      <span>₹{studio.price}/hr</span>
                    </div>
                    <button
                      onClick={() => navigate('/book')}
                      className="btn-outline w-fit text-sm"
                    >
                      View Details &amp; Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────── */}
      <section id="about" className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full" />
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
              alt="About Studio"
              loading="lazy"
              className="relative z-10 w-full h-[500px] object-cover rounded-2xl glass"
            />
          </div>
          <div className="lg:w-1/2">
            <h2 className="font-display text-4xl mb-6">MORE THAN JUST A SPACE</h2>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Founded in 2010, our studio has been the creative home for thousands of photographers,
              filmmakers, and brands. We provide state-of-the-art facilities with an atmosphere
              designed to inspire.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-display text-amber-400 mb-2">12+</div>
                <div className="text-white/60 uppercase tracking-widest text-sm">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-display text-amber-400 mb-2">50k+</div>
                <div className="text-white/60 uppercase tracking-widest text-sm">Successful Shoots</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────── */}
      <section id="contact" className="py-24 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-10 flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <h2 className="font-display text-3xl mb-6">GET IN TOUCH</h2>
              <div className="space-y-6">
                {[
                  { icon: <MapPin size={20} />, label: 'Address', value: '123 Creative Blvd, NY 10012' },
                  { icon: <Phone size={20} />, label: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: <Mail size={20} />, label: 'Email', value: 'hello@studio.com' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-amber-400 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm text-white/50">{item.label}</div>
                      <div>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-1/2">
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <input type="text" placeholder="Your Name" className="input-field" />
                <input type="email" placeholder="Your Email" className="input-field" />
                <textarea placeholder="Message" rows="4" className="input-field resize-none" />
                <button type="submit" className="btn-primary w-full py-3">SEND MESSAGE</button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;