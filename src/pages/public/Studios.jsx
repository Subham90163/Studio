import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, IndianRupee, ArrowRight } from 'lucide-react';

const FALLBACK_STUDIOS = [
  {
    id: 1,
    name: 'Studio A - The White Room',
    capacity: 10,
    price: 150,
    image: 'https://images.unsplash.com/photo-1621784563330-caee0b138a00?w=1000&q=80',
    description: 'A sunlit, minimalist studio with south-facing windows, polished white floors, and an expansive cyclorama wall. Ideal for fashion, lookbooks, and high-key commercials.'
  },
  {
    id: 2,
    name: 'Studio B - The Dark Room',
    capacity: 25,
    price: 200,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&q=80',
    description: 'Black-out capabilities, overhead rigging, RGB tube systems, and acoustically treated walls. Engineered specifically for dramatic music videos, cinematic interviews, and podcast sets.'
  }
];

const Studios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/studios')
      .then(res => {
        const d = res.data?.data ?? res.data;
        if (Array.isArray(d) && d.length > 0) {
          setStudios(d);
        } else {
          setStudios(FALLBACK_STUDIOS);
        }
      })
      .catch(() => {
        setStudios(FALLBACK_STUDIOS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">OUR STUDIOS</h1>
        <div className="w-16 h-1 bg-amber-500 mx-auto"></div>
        <p className="mt-6 text-white/60 max-w-2xl mx-auto">
          State-of-the-art creative spaces engineered for photography, cinematography, and high-impact productions.
        </p>
      </div>

      {loading ? (
        <div className="space-y-12">
          {[1, 2].map(i => (
            <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {studios.map((studio, index) => {
            const id = studio.id ?? studio._id;
            const price = studio.price ?? studio.pricePerHour ?? 100;
            return (
              <div
                key={id}
                className={`glass rounded-2xl overflow-hidden flex flex-col ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } group border border-white/[0.08] hover:border-white/20 transition-all`}
              >
                <div className="md:w-1/2 h-72 sm:h-96 md:h-auto overflow-hidden relative">
                  <img
                    src={studio.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&q=80'}
                    alt={studio.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                </div>

                <div className="p-8 sm:p-12 md:w-1/2 flex flex-col justify-center bg-white/[0.01]">
                  <h3 className="text-2xl sm:text-3xl font-display font-semibold mb-4 text-white">
                    {studio.name}
                  </h3>
                  <p className="text-white/60 mb-6 text-base leading-relaxed">
                    {studio.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8 border-y border-white/[0.08] py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-400">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Capacity</div>
                        <div className="font-medium text-white">{studio.capacity} people</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-400">
                        <IndianRupee size={18} />
                      </div>
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Hourly Rate</div>
                        <div className="font-medium text-amber-400">₹{price} / hour</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/book')}
                    className="btn-primary w-fit px-8 py-3.5 flex items-center gap-2 group-hover:bg-amber-500/20"
                  >
                    <span>Reserve This Studio</span>
                    <ArrowRight size={18} />
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

export default Studios;