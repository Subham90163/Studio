import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Video, Camera, Calendar, CreditCard, Settings, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Studios', path: '/admin/studios', icon: <Video size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <Camera size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <Calendar size={20} /> },
    { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 glass border-r border-white/[0.08] hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <Link to="/" className="font-display text-2xl font-semibold text-gold-400 tracking-widest">STUDIO</Link>
          <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">Admin Panel</div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menu.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.name} to={item.path} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/[0.08]">
          <button onClick={() => logout()} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-white/5 transition-all w-full">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-[#0a0a0a]">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;