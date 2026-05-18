import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Camera, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import API_URL from '../config';

const Login = () => {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Access Denied: Invalid Credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4 relative overflow-hidden">
      
      {/* Background Tech Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-[#1a1a1a] p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 relative z-10"
      >
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto h-20 w-20 bg-cyan-500/10 text-cyan-400 rounded-3xl flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          >
            <Camera size={38} strokeWidth={1.5} />
          </motion.div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Face<span className="text-cyan-400">Vault</span>
          </h2>
          <p className="mt-3 text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">
            Biometric Access Terminal
          </p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleLogin}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold py-3 px-4 rounded-xl text-center uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input
                type="email"
                required
                className="w-full bg-[#121212] border border-white/5 rounded-2xl px-12 py-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all sm:text-sm"
                placeholder="identity@vault.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input
                type="password"
                required
                className="w-full bg-[#121212] border border-white/5 rounded-2xl px-12 py-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center py-4 px-4 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_20px_rgba(8,145,178,0.2)] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <span className="flex items-center gap-2">
                  Login <ArrowRight size={16} />
                </span>
              )}
            </button>
          </motion.div>

          <div className="text-center pt-4">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              Don't have a account?{' '}
              <Link to="/register" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                Register
              </Link>
            </p>
          </div>
        </form>
      </motion.div>

      {/* Aesthetic Footer Detail */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <p className="text-[10px] text-gray-800 font-mono tracking-[0.5em] uppercase">
          Authorization Required // 256-bit AES
        </p>
      </div>
    </div>
  );
};

export default Login;