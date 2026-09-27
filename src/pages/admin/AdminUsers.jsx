import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, X, AlertCircle, CheckCircle, UserCheck, UserX } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
  });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => {
        const d = res.data?.data ?? res.data;
        setUsers(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (user) => {
    const id = user._id ?? user.id;
    setToggling(id);
    try {
      await api.put(`/admin/users/${id}/toggle`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (user) => {
    const id = user._id ?? user.id;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently remove user "${user.name}" (${user.email})?`
    );
    if (!confirmDelete) return;

    setDeleting(id);
    try {
      const res = await api.delete(`/admin/users/${id}`);
      alert(res.data?.message || 'User deleted successfully.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!modalForm.phone || !modalForm.phone.trim()) {
      setModalError('Phone number is mandatory.');
      return;
    }

    if (modalForm.password.length < 6) {
      setModalError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/users', {
        name: modalForm.name.trim(),
        email: modalForm.email.trim(),
        phone: modalForm.phone.trim(),
        password: modalForm.password,
        role: modalForm.role,
      });

      setModalSuccess('User created successfully!');
      setTimeout(() => {
        setShowModal(false);
        setModalForm({ name: '', email: '', phone: '', password: '', role: 'USER' });
        setModalSuccess('');
        load();
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Manage Users</h1>
          <p className="text-white/60 text-sm mt-1">Total Users: {users.length} | Active: {users.filter(u => u.isActive).length}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            className="input-field py-2 w-full sm:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => {
              setModalError('');
              setModalSuccess('');
              setShowModal(true);
            }}
            className="btn-primary py-2 px-4 flex items-center gap-2 shrink-0 text-sm"
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Name', 'Email', 'Phone (Mandatory)', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-white/50 font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50">No users found.</td></tr>
              ) : filtered.map(u => {
                const uId = u._id ?? u.id;
                const isSelf = currentUser?.id === uId || currentUser?.email === u.email;
                return (
                  <tr key={uId} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium">
                      {u.name}
                      {isSelf && <span className="ml-2 text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">You</span>}
                    </td>
                    <td className="p-4 text-white/70 text-sm">{u.email}</td>
                    <td className="p-4 text-white/90 text-sm font-mono">
                      {u.phone || <span className="text-red-400 text-xs italic">Missing Phone</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/60'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => handleToggle(u)}
                              disabled={toggling === uId}
                              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                                u.isActive
                                  ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                  : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                              } disabled:opacity-40`}
                            >
                              {toggling === uId ? '…' : u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={deleting === uId}
                              className="text-xs px-2.5 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1 disabled:opacity-40"
                              title="Delete User"
                            >
                              <Trash2 size={13} /> {deleting === uId ? '…' : 'Remove'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card w-full max-w-md p-8 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-white/60 hover:text-white" />
              </button>
            </div>

            {modalError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" /> {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <CheckCircle size={16} className="shrink-0" /> {modalSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={modalForm.name}
                  onChange={e => setModalForm({ ...modalForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Email <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="name@example.com"
                  value={modalForm.email}
                  onChange={e => setModalForm({ ...modalForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Phone Number <span className="text-amber-400">* (Mandatory)</span>
                </label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={modalForm.phone}
                  onChange={e => setModalForm({ ...modalForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Password <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="At least 6 characters"
                  value={modalForm.password}
                  onChange={e => setModalForm({ ...modalForm, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Role</label>
                <select
                  className="input-field"
                  value={modalForm.role}
                  onChange={e => setModalForm({ ...modalForm, role: e.target.value })}
                >
                  <option value="USER" className="bg-[#18181b] text-white">USER (Customer)</option>
                  <option value="ADMIN" className="bg-[#18181b] text-white">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 mt-2 disabled:opacity-50"
              >
                {submitting ? 'Creating User…' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;