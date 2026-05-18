import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Image as ImageIcon, LayoutDashboard, ShieldCheck, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Scanner from '../components/Scanner';
import Gallery from '../components/Gallery';
import ManageGalleryModal from '../components/ManageGalleryModal';
import API_URL from '../config';

const Dashboard = () => {
  const [matchedPhotos, setMatchedPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false);
  const [showGalleryOnMobile, setShowGalleryOnMobile] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const navigate = useNavigate();

  const handleScanComplete = async (file) => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      navigate('/login');
      return;
    }

    if (isDatabaseEmpty) {
      setError("Database is empty. Please upload photos to the database first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSearched(true);
    setShowGalleryOnMobile(true);
    const formData = new FormData();
    formData.append('selfie', file);
    const userInfo = JSON.parse(userInfoStr);

    try {
      const response = await axios.post(`${API_URL}/photos/search`, formData, {
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
    // Instead of navigating to login immediately, we can just stay on dashboard 
    // but the UI will reflect logged out state (e.g. no database access)
    // However, user said "redirect it to login first if user is not logged In" when they try to upload
    // So staying on dashboard is fine.
    window.location.reload(); // Refresh to clear state
  };

  const resetGallery = () => {
    setMatchedPhotos([]);
    setError(null);
    setIsSearched(false);
    setShowGalleryOnMobile(false);
  };

  const handleManageGallery = () => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      navigate('/login');
      return;
    }
    setIsManageModalOpen(true);
  };

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      setUserRole(userInfo.user?.role || userInfo.role || 'user');
    }
    
    const fetchAllPhotos = async () => {
      try {
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
        // Only fetch all photos if logged in, otherwise keep it empty or handled by search
        if (!userInfo) {
          setIsDatabaseEmpty(false); // Reset for guests
          return;
        }

        const response = await axios.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        const photos = response.data.images.map(img => img.imageUrl) || [];
        setAllPhotos(photos);
        setIsDatabaseEmpty(photos.length === 0);
      } catch (error) { 
        console.error(error);
        setIsDatabaseEmpty(true);
      }
    };
    if (!isManageModalOpen) fetchAllPhotos();
  }, [isManageModalOpen]);

  return (
    // Changed h-screen and overflow-hidden to min-h-screen and overflow-y-auto to allow scrolling
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-gray-100 overflow-y-auto">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="bg-[#161616]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 p-2 rounded-lg"><LayoutDashboard size={20} className="text-black" /></div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Face<span className="text-cyan-400">Vault</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {userRole === 'admin' && (
              <button onClick={() => navigate('/admin')} className="text-xs font-bold text-cyan-400 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <ShieldCheck size={16} /> <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}
            <button onClick={handleManageGallery} className="text-xs font-bold text-gray-400 hover:text-cyan-400 transition-all uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={16} /> <span className="hidden sm:inline">Database</span>
            </button>
            {localStorage.getItem('userInfo') ? (
              <button onClick={handleLogout} className="text-xs font-bold text-red-400/70 hover:text-red-400 px-4 py-2 bg-red-500/5 rounded-xl border border-red-500/10 flex items-center gap-2">
                <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="text-xs font-bold text-cyan-400/70 hover:text-cyan-400 px-4 py-2 bg-cyan-500/5 rounded-xl border border-cyan-500/10 flex items-center gap-2">
                <ShieldCheck size={16} /> <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area: Removed overflow-hidden to allow natural page scroll */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
          
          {/* Left: Scanner */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className={`lg:col-span-5 flex flex-col ${showGalleryOnMobile ? 'hidden lg:flex' : 'flex'}`}
          >
            <Scanner 
              onScanComplete={handleScanComplete} 
              isLoading={isLoading} 
              isDatabaseEmpty={isDatabaseEmpty}
            />
          </motion.div>

          {/* Right: Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className={`lg:col-span-7 relative ${!showGalleryOnMobile ? 'hidden lg:block' : 'block'}`}
          >
            <Gallery
              matchedPhotos={isSearched ? matchedPhotos : allPhotos}
              error={error}
              isSearched={isSearched}
              onReset={resetGallery}
              isLoading={isLoading}
              isDatabaseEmpty={isDatabaseEmpty}
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