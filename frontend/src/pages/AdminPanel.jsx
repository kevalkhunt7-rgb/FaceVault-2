import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, User as UserIcon, Loader2, ChevronRight, Search, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import API_URL from '../config';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 mr-2"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-lg">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic">Admin <span className="text-cyan-400">Panel</span></h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Biometric Access Management</p>
            </div>
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Identities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161616] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#161616]/50 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-xl">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-cyan-400" size={40} />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Decrypting User Data...</p>
            </div>
          ) : error ? (
            <div className="p-20 flex flex-col items-center justify-center text-red-400 gap-4">
              <AlertCircle size={40} />
              <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-[#1a1a1a]/50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Contact</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Uploads</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Clearance</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user) => (
                      <motion.tr 
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-400 border border-white/5">
                              <UserIcon size={18} />
                            </div>
                            <span className="font-bold text-sm text-gray-200">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-mono text-gray-500">{user.email}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20">
                              {user.totalUploads || 0}
                            </span>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Assets</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            user.role === 'admin' 
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                              : 'bg-gray-500/10 text-gray-400 border border-white/5'
                          }`}>
                            {user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                            {user.role}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                              disabled={updatingUserId === user._id}
                              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border ${
                                user.role === 'admin'
                                  ? 'text-red-400 border-red-500/20 hover:bg-red-500/10'
                                  : 'text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10'
                              } disabled:opacity-50`}
                            >
                              {updatingUserId === user._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                `Set as ${user.role === 'admin' ? 'User' : 'Admin'}`
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredUsers.length === 0 && !isLoading && (
                <div className="p-20 text-center text-gray-600 font-bold uppercase tracking-[0.2em]">
                  No identities match your search parameters
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
