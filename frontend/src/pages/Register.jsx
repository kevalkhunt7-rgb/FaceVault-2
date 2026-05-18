import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Camera, User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';
import API_URL from '../config';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'System rejection: Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-[#1a1a1a] p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 relative z-10"
      >
        <div className="text-center">
          <motion.div 
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="mx-auto h-16 w-16 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/20 shadow-inner"
          >
            <UserPlus size={32} />
          </motion.div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
            Create <span className="text-cyan-400">Profile</span>
          </h2>
          
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold py-3 px-4 rounded-xl text-center uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input
                type="text"
                required
                className="w-full bg-[#121212] border border-white/5 rounded-2xl px-12 py-3.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input
                type="email"
                required
                className="w-full bg-[#121212] border border-white/5 rounded-2xl px-12 py-3.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all sm:text-sm"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input
                type="password"
                required
                className="w-full bg-[#121212] border border-white/5 rounded-2xl px-12 py-3.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-4 px-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cyan-400 transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : ' Register'}
          </motion.button>

          <div className="text-center pt-4">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              Existing Account?{' '}
              <Link to="/login" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                Terminal Login
              </Link>
            </p>
          </div>
        </form>
      </motion.div>

      {/* Decorative Corner Element */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-500" />
          <span className="text-[10px] text-gray-700 font-mono tracking-[0.3em] uppercase">Auth_Module_v3</span>
        </div>
      </div>
    </div>
  );
};

export default Register;