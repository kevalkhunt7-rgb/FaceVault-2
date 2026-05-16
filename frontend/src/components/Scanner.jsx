import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, RefreshCcw, Upload, Image as ImageIcon, CheckCircle2, Scan } from 'lucide-react';

const Scanner = ({ onScanComplete, isLoading, isDatabaseEmpty }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('camera');
  const [capturedImg, setCapturedImg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImg(imageSrc);
  }, [webcamRef]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const reset = () => {
    setCapturedImg(null);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitFace = async () => {
    if (activeTab === 'camera' && capturedImg) {
      const res = await fetch(capturedImg);
      const blob = await res.blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      onScanComplete(file);
    } else if (activeTab === 'upload' && selectedFile) {
      onScanComplete(selectedFile);
    }
  };

  return (
    <>
      <style>{`
        @keyframes scan-move {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { border-color: rgba(34, 211, 238, 0.2); box-shadow: 0 0 5px rgba(34, 211, 238, 0.1); }
          50% { border-color: rgba(34, 211, 238, 0.6); box-shadow: 0 0 20px rgba(34, 211, 238, 0.2); }
        }
        .animate-scan-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, transparent, #22d3ee, transparent);
          box-shadow: 0 0 15px #22d3ee;
          z-index: 20;
          animation: scan-move 2.5s ease-in-out infinite;
        }
        .biometric-frame {
          animation: pulse-glow 3s infinite;
        }
      `}</style>

      <div className="w-full max-w-md mx-auto bg-[#1a1a1a] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="p-8 text-center bg-gradient-to-b from-[#242424] to-[#1a1a1a]">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          >
            <Scan size={28} className={isLoading ? "animate-spin" : ""} />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-100 tracking-tight">AI Identity Scan</h2>
          <p className="text-gray-400 mt-2 text-sm">
            {activeTab === 'camera' 
              ? "Align your face for biometric verification."
              : "Upload portrait for facial recognition."}
          </p>
        </div>

        {/* Dark Tab Switcher */}
        <div className="px-8 mb-6">
          <div className="flex p-1 bg-[#121212] rounded-2xl border border-white/5 relative">
            {['camera', 'upload'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); reset(); }}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  activeTab === tab ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'camera' ? <Camera size={14} /> : <Upload size={14} />}
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabDark"
                    className="absolute inset-0 bg-[#222] border border-white/10 shadow-inner rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="px-8 pb-10 flex flex-col items-center">
          {/* Viewport Area */}
          <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-[#0a0a0a] ring-1 ring-white/10 shadow-2xl group">
            
            {/* Scanning Animation */}
            {!capturedImg && !selectedFile && activeTab === 'camera' && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="animate-scan-line" />
                
                {/* Targeting Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2/3 h-4/5 border border-white/10 rounded-[120px] biometric-frame flex items-center justify-center">
                       <div className="w-10 h-[1px] bg-cyan-400/30 absolute top-1/2 left-0" />
                       <div className="w-10 h-[1px] bg-cyan-400/30 absolute top-1/2 right-0" />
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-md" />
                <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-md" />
                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-md" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-cyan-400/50 rounded-br-md" />
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center transition-all">
                <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
                <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.3em]">Processing Metadata</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'camera' ? (
                <motion.div 
                  key="webcam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  {!capturedImg ? (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover grayscale-[30%] scale-x-[-1]"
                      videoConstraints={{ facingMode: "user" }}
                    />
                  ) : (
                    <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full bg-[#121212]"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-2 border-dashed border-white/5 rounded-[2rem]">
                      <ImageIcon size={40} className="text-gray-700 mb-4" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Browse File</p>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </label>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Success Notification */}
            {(capturedImg || selectedFile) && !isLoading && (
               <motion.div 
                 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                 className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)] z-20"
               >
                  <CheckCircle2 size={14} /> Ready to search
               </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-8 flex flex-col gap-3">
            {activeTab === 'camera' && !capturedImg ? (
              <button
                onClick={capture}
                className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold hover:bg-cyan-500 transition-all active:scale-[0.98] flex justify-center items-center gap-3 shadow-[0_10px_30px_rgba(8,145,178,0.3)]"
              >
                <Camera size={20} />
                Start Capture
              </button>
            ) : (capturedImg || selectedFile) && (
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  disabled={isLoading}
                  className="flex-1 bg-[#2a2a2a] text-gray-400 py-4 rounded-2xl font-bold hover:bg-[#333] transition-all flex justify-center items-center gap-2 border border-white/5"
                >
                  <RefreshCcw size={16} />
                  Reset
                </button>
                <button
                  onClick={submitFace}
                  disabled={isLoading || isDatabaseEmpty}
                  className={`flex-[2] py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                    isDatabaseEmpty 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                    : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_10px_30px_rgba(8,145,178,0.3)]'
                  }`}
                >
                  {isDatabaseEmpty ? 'DB Empty' : 'Analyze Face'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Scanner;