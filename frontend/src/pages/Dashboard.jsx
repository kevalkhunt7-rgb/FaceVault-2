import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Image as ImageIcon, LayoutDashboard, ShieldCheck, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Scanner from '../components/Scanner';
import Gallery from '../components/Gallery';
import ManageGalleryModal from '../components/ManageGalleryModal';

const Dashboard = () => {
  const [matchedPhotos, setMatchedPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  const navigate = useNavigate();

  const handleScanComplete = async (file) => {
    setIsLoading(true);
    setError(null);
    setIsSearched(true);
    const formData = new FormData();
    formData.append('selfie', file);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      const response = await axios.post('http://localhost:5001/api/photos/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setMatchedPhotos(response.data.matches || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Match failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const resetGallery = () => {
    setMatchedPhotos([]);
    setError(null);
    setIsSearched(false);
  };

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) { navigate('/login'); return; }
    const userInfo = JSON.parse(userInfoStr);

    const fetchAllPhotos = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/photos', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setAllPhotos(response.data.images.map(img => img.imageUrl) || []);
      } catch (error) { console.error(error); }
    };
    if (!isManageModalOpen) fetchAllPhotos();
  }, [navigate, isManageModalOpen]);

  return (
    // h-screen and overflow-hidden prevents the whole page from scrolling
    <div className="h-screen flex flex-col bg-[#0f0f0f] text-gray-100 overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="bg-[#161616]/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 p-2 rounded-lg"><LayoutDashboard size={20} className="text-black" /></div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Face<span className="text-cyan-400">Vault</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsManageModalOpen(true)} className="text-xs font-bold text-gray-400 hover:text-cyan-400 transition-all uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={16} /> <span className="hidden sm:inline">Database</span>
            </button>
            <button onClick={handleLogout} className="text-xs font-bold text-red-400/70 hover:text-red-400 px-4 py-2 bg-red-500/5 rounded-xl border border-red-500/10 flex items-center gap-2">
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: flex-1 and overflow-hidden ensures child components handle their own scrolling */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left: Scanner */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 flex flex-col">
            <Scanner onScanComplete={handleScanComplete} isLoading={isLoading} />
          </motion.div>

          {/* Right: Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-7 h-full relative overflow-hidden">
            <Gallery
              matchedPhotos={isSearched ? matchedPhotos : allPhotos}
              error={error}
              isSearched={isSearched}
              onReset={resetGallery}
            />


          </motion.div>
        </div>
      </main>

      <footer className="px-8 py-2 bg-[#0a0a0a] border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-mono tracking-widest">
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> SYSTEM_ONLINE</div>
        <div className="flex items-center gap-4"><ShieldCheck size={12}/> ENCRYPTED_CORE</div>
      </footer>

      <ManageGalleryModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} />
    </div>
  );
};

export default Dashboard;