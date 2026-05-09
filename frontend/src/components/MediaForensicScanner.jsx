import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSearch, 
  Upload, 
  Image as ImageIcon, 
  FileAudio, 
  Video, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Fingerprint,
  Zap,
  ShieldCheck,
  Search
} from 'lucide-react';
import { extractMediaClaim, verifyClaim } from '../api';
import { IntelDashboard } from './IntelDashboard';
import { VerdictDashboard } from './VerdictDashboard';

export const MediaForensicScanner = () => {
  const [file, setFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [extractedClaim, setExtractedClaim] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExtractedClaim('');
      setVerificationResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsExtracting(true);
    setError(null);
    try {
      const data = await extractMediaClaim(file);
      setExtractedClaim(data.claim);
    } catch (err) {
      setError('Neural Extraction Failed. The file format might be corrupted or unsupported.');
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVerify = async () => {
    if (!extractedClaim) return;

    setIsVerifying(true);
    try {
      const data = await verifyClaim(extractedClaim);
      setVerificationResult(data);
    } catch (err) {
      setError('Vault Connection Interrupted during Deep Verification.');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setExtractedClaim('');
    setVerificationResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (verificationResult) {
    return (
      <div className="pt-8">
        <div className="max-w-7xl mx-auto px-4 mb-8 flex justify-between items-center">
          <button 
            onClick={() => setVerificationResult(null)}
            className="text-cyan-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:text-cyan-400 transition-colors"
          >
            ← Back to Extraction
          </button>
          <div className="px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
            Verification Protocol Alpha-7
          </div>
        </div>
        <VerdictDashboard result={verificationResult} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6"
        >
          <Fingerprint className="w-12 h-12 text-cyan-500" />
        </motion.div>
        <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-4">
          Media <span className="text-cyan-500">Forensics</span>
        </h2>
        <p className="text-slate-400 font-medium tracking-wide">
          Upload images, audio, or video for multi-modal claim extraction and neural truth verification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Upload Panel */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="cyber-card relative overflow-hidden group"
        >
          {isExtracting && <div className="scanner-line" />}
          
          <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-white/5 rounded-2xl group-hover:border-cyan-500/30 transition-colors">
            {!file ? (
              <>
                <div className="flex gap-4 mb-6">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                  <FileAudio className="w-8 h-8 text-slate-600" />
                  <Video className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6">
                  Drop evidence here or click to browse
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept="image/*,audio/*,video/*"
                  id="forensic-upload"
                />
                <label 
                  htmlFor="forensic-upload"
                  className="cyber-button cursor-pointer"
                >
                  <Upload size={16} /> Select Source File
                </label>
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 mb-8">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    {file.type.startsWith('image/') && <ImageIcon className="text-cyan-400" />}
                    {file.type.startsWith('audio/') && <FileAudio className="text-cyan-400" />}
                    {file.type.startsWith('video/') && <Video className="text-cyan-400" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                  <button 
                    onClick={resetScanner}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-500 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {!extractedClaim && (
                  <button 
                    onClick={handleUpload}
                    disabled={isExtracting}
                    className="cyber-button w-full py-4 text-sm"
                  >
                    {isExtracting ? (
                      <><Loader2 className="animate-spin" size={18} /> Initializing Neural Extraction...</>
                    ) : (
                      <><Zap size={18} /> Start Forensic Analysis</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Extraction Result */}
        <AnimatePresence>
          {extractedClaim && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6"
            >
              <div className="cyber-card border-l-4 border-l-cyan-500 bg-cyan-500/5">
                <div className="flex items-center gap-3 mb-4 text-cyan-400">
                  <ShieldCheck size={20} />
                  <h4 className="font-black uppercase tracking-widest text-xs">Extracted Intelligence Claim</h4>
                </div>
                <p className="text-xl text-slate-200 font-light italic leading-relaxed">
                  "{extractedClaim}"
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="flex-1 cyber-button py-4 border-cyan-500 bg-cyan-500/20 text-cyan-400"
                >
                  {isVerifying ? (
                    <><Loader2 className="animate-spin" /> Verifying with Vault Core...</>
                  ) : (
                    <><Search size={18} /> Perform Deep Truth Scan</>
                  )}
                </button>
                <button 
                  onClick={resetScanner}
                  className="px-6 border border-white/10 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all uppercase text-[10px] font-black tracking-widest"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400"
          >
            <AlertCircle size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Decorative Grid */}
      <div className="mt-20 grid grid-cols-3 gap-4 opacity-20">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-1 bg-gradient-to-right from-transparent via-slate-700 to-transparent" />
        ))}
      </div>
    </div>
  );
};
