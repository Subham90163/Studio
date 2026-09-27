import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Menu, X, Calendar, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Studios', path: '/studios' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/85 backdrop-blur-[20px] border-b border-white/[0.08] shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="font-display text-2xl font-bold text-amber-400 tracking-wider">
            STUDIO<span className="text-white text-base font-light ml-1">PRO</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}

            {/* If user logged in, provide direct links to My Bookings and Payments */}
            {user && !isAdmin && (
              <>
                <Link to="/bookings" className="text-sm font-medium text-white/80 hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                  <Calendar size={15} />
                  <span>My Bookings</span>
                </Link>
                <Link to="/payments" className="text-sm font-medium text-white/80 hover:text-amber-400 transition-colors">
                  Payments
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-white/60">Hi, {user.name}</span>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="text-sm text-white/80 hover:text-white">
                  {isAdmin ? "Admin Panel" : "Dashboard"}
                </Link>
                {/* Book Session button in bar */}
                {!isAdmin && (
                  <Link to="/book" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                    <PlusCircle size={14} />
                    <span>Book Session</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="text-sm text-white/70 hover:text-red-400 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white">Login</Link>
                <Link to="/book" className="btn-primary text-sm py-2 px-5">Book Now</Link>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/80 hover:text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass absolute top-20 left-0 w-full border-t border-white/[0.06] flex flex-col items-center py-6 space-y-4">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-lg font-medium text-white/80 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
          {user && !isAdmin && (
            <>
              <Link to="/bookings" className="text-lg text-white/80" onClick={() => setMobileMenuOpen(false)}>
                My Bookings
              </Link>
              <Link to="/payments" className="text-lg text-white/80" onClick={() => setMobileMenuOpen(false)}>
                Payments
              </Link>
            </>
          )}
          {user ? (
            <>
              <Link to={isAdmin ? "/admin" : "/dashboard"} className="text-lg text-white/80" onClick={() => setMobileMenuOpen(false)}>
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
              {!isAdmin && (
                <Link to="/book" className="btn-primary w-2/3 text-center" onClick={() => setMobileMenuOpen(false)}>
                  Book Session
                </Link>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-lg text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-lg text-white/80" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/book" className="btn-primary w-2/3 text-center" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;