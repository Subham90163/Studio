import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowRight, Clock } from 'lucide-react';

const FALLBACK_SERVICES = [
  { id: 1, name: 'Photography', description: 'Professional studio photography for fashion, portraits, editorials, and commercial campaigns.', price: 100, duration: 60, image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80' },
  { id: 2, name: 'Videography', description: 'Cinematic 4K video production with industry-standard lighting, audio, and stabilization equipment.', price: 200, duration: 120, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80' },
  { id: 3, name: 'Studio Rental', description: 'Full studio access including backdrops, makeup stations, and private lounge for your creative crew.', price: 80, duration: 60, image: 'https://images.unsplash.com/photo-1621784563330-caee0b138a00?w=600&q=80' },
  { id: 4, name: 'Product Shoot', description: 'Crisp, high-definition e-commerce product staging, tabletop lighting, and post-production processing.', price: 150, duration: 90, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
];

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/services')
      .then(res => {
        const d = res.data?.data ?? res.data;
        if (Array.isArray(d) && d.length > 0) {
          setServices(d);
        } else {
          setServices(FALLBACK_SERVICES);
        }
      })
      .catch(() => {
        setServices(FALLBACK_SERVICES);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">OUR SERVICES</h1>
        <div className="w-16 h-1 bg-amber-500 mx-auto"></div>
        <p className="mt-6 text-white/60 max-w-2xl mx-auto">
          Tailored creative solutions designed for creators, commercial brands, and discerning artists.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card h-80 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((svc) => {
            const id = svc.id ?? svc._id;
            return (
              <div
                key={id}
                className="glass-card overflow-hidden group p-0 flex flex-col justify-between transition-all hover:scale-[1.02] hover:border-white/20"
              >
                <div>
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={svc.image || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80'}
                      alt={svc.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-white">{svc.name}</h3>
                    <p className="text-white/60 text-sm mb-4 leading-relaxed line-clamp-3">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-white/[0.05] flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-amber-400 font-semibold text-lg">₹{svc.price}</div>
                    {svc.duration && (
                      <div className="text-xs text-white/40 flex items-center gap-1">
                        <Clock size={12} /> {svc.duration} min
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/book')}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <span>Book</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Services;