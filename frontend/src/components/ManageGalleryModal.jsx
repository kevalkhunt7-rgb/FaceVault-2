import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Image as ImageIcon, Loader2, Check, MousePointer2, Layers } from 'lucide-react';
import API_URL from '../config';

const ManageGalleryModal = ({ isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) fetchImages();
  }, [isOpen]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await axios.get(`${API_URL}/api/photos`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const formData = new FormData();
    for (const file of e.target.files) formData.append('photos', file);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await axios.post(`${API_URL}/api/photos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`
        }
      });
      
      if (response.data.errors) {
        const successCount = response.data.count || 0;
        const errorCount = response.data.errors.length;
        alert(`Processed ${successCount + errorCount} files. ${successCount} uploaded, ${errorCount} skipped (no face detected or error).`);
      }
      
      fetchImages();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Upload failed.';
      alert(errorMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSelection = (publicId) => {
    const newSelection = new Set(selectedImages);
    newSelection.has(publicId) ? newSelection.delete(publicId) : newSelection.add(publicId);
    setSelectedImages(newSelection);
  };

  const handleDeleteSelected = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await Promise.all([...selectedImages].map(id => 
        axios.delete(`${API_URL}/api/photos/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
      ));
      setSelectedImages(new Set());
      fetchImages();
    } catch (error) {
      alert('Deletion error.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-5xl h-full sm:h-[85vh] flex flex-col overflow-hidden relative border border-white/5"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#1a1a1a]/50 sticky top-0 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100 tracking-tight">Media Control Center</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{images.length} Objects Indexed</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-5 bg-[#121212]/50 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isUploading ? 'Syncing...' : 'Upload Assets'}
            </button>
            
            <AnimatePresence>
              {selectedImages.size > 0 && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-lg border border-cyan-400/20"
                >
                  {selectedImages.size} SELECTED
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            {selectedImages.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 text-red-400 bg-red-500/10 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20"
              >
                <Trash2 size={16} />
                Purge
              </button>
            )}
            <button 
               onClick={() => setSelectedImages(selectedImages.size === images.length ? new Set() : new Set(images.map(i => i.publicId)))}
               className="text-[10px] font-bold text-gray-500 hover:text-gray-300 px-4 py-2 uppercase tracking-widest transition-colors"
            >
              {selectedImages.size === images.length ? 'Clear Selection' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0f0f0f]/50">
          {isLoading && images.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ImageIcon size={48} className="text-gray-600 mb-4" />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Archive Empty</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {images.map((photo) => {
                const isSelected = selectedImages.has(photo.publicId);
                return (
                  <motion.div
                    key={photo.publicId}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSelection(photo.publicId)}
                    className="relative group aspect-square cursor-pointer"
                  >
                    <div className={`relative h-full w-full rounded-[1.5rem] overflow-hidden transition-all duration-300 border-2 ${
                      isSelected ? 'border-cyan-400 ring-4 ring-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'border-white/5'
                    }`}>
                      <img
                        src={photo.imageUrl}
                        alt="Asset"
                        className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'scale-110 grayscale-[50%]' : 'group-hover:scale-110'}`}
                      />
                      
                      {/* Dark Overlays */}
                      <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-cyan-900/20 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`} />
                      
                      {/* Selection UI */}
                      <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isSelected ? 'bg-cyan-400 text-black scale-100' : 'bg-black/60 text-white/50 scale-0 group-hover:scale-100 backdrop-blur-md border border-white/10'
                      }`}>
                        {isSelected ? <Check size={18} strokeWidth={3} /> : <MousePointer2 size={14} />}
                      </div>

                      {/* Info Badge (Hover) */}
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="bg-black/60 backdrop-blur-md text-[8px] text-gray-300 px-2 py-1 rounded-md border border-white/5 uppercase tracking-tighter">
                           {photo.publicId.split('/').pop().substring(0, 10)}...
                         </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* End of Gallery Footer */}
        <div className="p-4 bg-[#1a1a1a] border-t border-white/5 text-center">
            <p className="text-[9px] text-gray-700 font-bold uppercase tracking-[0.4em]">Secure Access Controlled</p>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        `}</style>

        {/* Custom Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#1a1a1a] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-xs overflow-hidden border border-white/5"
              >
                {/* Red Curved Header */}
                <div className="relative h-32 bg-gradient-to-b from-red-600 to-red-900 flex items-center justify-center">
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1a1a1a] rounded-t-[3rem]" />
                  <div className="relative z-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4">
                    <Trash2 size={32} className="text-red-600" />
                  </div>
                </div>

                <div className="px-8 pb-8 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Are You Sure?</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-8">
                    You are about to delete {selectedImages.size} selected {selectedImages.size === 1 ? 'asset' : 'assets'}. This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={confirmDelete}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/20"
                    >
                      YES
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-gray-400 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-white/5"
                    >
                      NO
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ManageGalleryModal;