import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, SearchX, Download, Maximize2, Sparkles, AlertCircle, ExternalLink, XCircle, Loader2 } from 'lucide-react';

const Gallery = ({ matchedPhotos, error, isSearched, onReset, isLoading }) => {
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const handleShare = async (url) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Captured Moment',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Image link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Moment_Match_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback to simple link if fetch fails
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `Moment_Match_${index + 1}.jpg`;
      link.click();
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden h-full flex flex-col transition-all duration-500">
      
      {/* Dark Refined Header */}
      <div className="p-8 border-b border-white/5 bg-[#1a1a1a]/80 backdrop-blur-xl sticky top-0 z-20 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <ImageIcon size={20} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
              Captured Moments
            </h2>
          </div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            {!isSearched 
              ? "Awaiting biometric input..."
              : isLoading 
                ? "Scanning database for matches..."
                : matchedPhotos.length > 0 
                  ? "AI-powered facial matches identified." 
                  : "Scanning database for matches..."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {isSearched && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={onReset} 
                className="bg-[#111] text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-cyan-500/20 shadow-lg flex items-center gap-2"
              >
                <XCircle size={14} /> Reset Results
              </motion.button>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {matchedPhotos.length > 0 && (
              <motion.span 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 bg-[#2a2a2a] border border-white/10 text-cyan-400 font-bold py-2 px-5 rounded-xl text-[10px] tracking-[0.2em] uppercase shadow-xl"
              >
                <Sparkles size={12} className="animate-pulse" />
                {matchedPhotos.length} {isSearched ? 'Found' : 'Files'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-[#121212]">
        {error ? (
          /* Error State */
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-4 text-red-500 border border-red-500/20">
              <AlertCircle size={40} />
            </div>
            <p className="text-lg font-bold text-gray-200">System Error</p>
            <p className="text-xs text-red-400 mt-2 font-mono bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/10">{error}</p>
          </motion.div>
        ) : matchedPhotos.length === 0 ? (
          /* Empty / Searching States */
          <div className="h-full flex flex-col items-center justify-center text-center">
            {isLoading && isSearched && matchedPhotos.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <div className="absolute inset-0 bg-cyan-500/5 blur-[100px]" />
                <div className="relative w-24 h-24 bg-[#1a1a1a] border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Loader2 size={48} className="text-cyan-400 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-200">Scanning for Matches...</h3>
                <p className="text-gray-500 mt-2 max-w-[260px] text-sm leading-relaxed">
                  Please wait while our AI sifts through thousands of moments.
                </p>
              </motion.div>
            ) : isSearched && matchedPhotos.length === 0 ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="w-24 h-24 bg-[#1a1a1a] border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <SearchX size={48} className="text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-200">No Match Found</h3>
                <p className="text-gray-500 mt-2 max-w-[260px] text-sm leading-relaxed">
                  The subject wasn't detected in our current database. Try a photo with <b>better lighting</b>.
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full" />
                <div className="relative bg-[#1a1a1a] border border-white/5 shadow-2xl rounded-[3rem] p-12">
                  <ImageIcon size={64} className="text-gray-800" />
                </div>
                <h3 className="text-lg font-bold text-gray-300 mt-8 tracking-widest uppercase text-xs">Awaiting Scan</h3>
              </motion.div>
            )}
          </div>
        ) : (
          /* Masonry Grid with Staggered Animation */
          <div className="columns-1 sm:columns-2 gap-5 space-y-5">
            <AnimatePresence>
              {matchedPhotos.map((photoUrl, index) => (
                <motion.div 
                  key={photoUrl} // Use URL as key for better tracking
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                  className="break-inside-avoid relative group rounded-3xl overflow-hidden bg-[#1a1a1a] border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all duration-500"
                >
                  {/* High Quality Image Container */}
                  <div className="relative overflow-hidden aspect-auto">
                    <img 
                      src={photoUrl} 
                      alt={`Match ${index + 1}`} 
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* UI Elements - Appear on Hover */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">

                    <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <button 
                        onClick={() => handleDownload(photoUrl, index)}
                        className="flex-1 bg-white text-black py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-xl"
                      >
                        <Download size={16} />
                        Save
                      </button>
                      <button 
                        onClick={() => setFullScreenImage(photoUrl)}
                        className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-colors border border-white/10"
                      >
                        <Maximize2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Corner Badge (Share) */}
                  <button 
                    onClick={() => handleShare(photoUrl)}
                    className="absolute top-4 left-4 bg-[#1a1a1a]/80 hover:bg-cyan-500/20 backdrop-blur-md border border-white/10 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    title="Share Asset"
                  >
                    <ExternalLink size={14} className="text-gray-300 hover:text-cyan-400" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setFullScreenImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullScreenImage}
              alt="Full Screen"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFullScreenImage(null);
              }}
            >
              <XCircle size={24} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #121212;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
};

export default Gallery;