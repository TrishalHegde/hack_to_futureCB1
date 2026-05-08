import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Image as ImageIcon, Music, Video, X, Terminal, Fingerprint, Activity, MapPin, Camera, Calendar } from 'lucide-react';

export const MediaForensicScanner = () => {
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };

  const startScan = () => {
    setIsScanning(true);
    // Simulate complex forensic scan
    setTimeout(() => {
      setIsScanning(false);
      setResults({
        metadata: {
          camera: "Sony Alpha a7R IV",
          date: "2026-05-08 14:22:10 UTC",
          gps: "40.7128° N, 74.0060° W",
          software: "Adobe Photoshop 24.0 (Windows)"
        },
        syntheticProbability: 82.4,
        transcript: "The quick brown fox jumps over the lazy dog..."
      });
    }, 4000);
  };

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'unknown';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/30">
          <Fingerprint className="text-cyan-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">Multimodal <span className="text-cyan-400">Forensics</span></h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Deep analysis of synthetic media & file integrity</p>
        </div>
      </div>

      {!file && (
        <motion.div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`relative border-2 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center transition-all duration-500 ${
            isHovering ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_50px_rgba(34,211,238,0.1)] scale-[1.01]' : 'border-slate-800'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsHovering(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <Upload className={`w-16 h-16 mb-6 transition-colors duration-500 ${isHovering ? 'text-cyan-400' : 'text-slate-600'}`} />
          <h3 className="text-xl font-bold text-slate-300 mb-2">Drop Media Payload</h3>
          <p className="text-slate-500 text-sm mb-8 font-mono uppercase tracking-widest text-center">Supports .JPG // .MP4 // .MP3</p>
          
          <label className="cyber-button cursor-pointer">
            Select Source
            <input type="file" className="hidden" accept=".jpg,.jpeg,.mp4,.mp3" onChange={(e) => handleFile(e.target.files[0])} />
          </label>
        </motion.div>
      )}

      {file && !results && !isScanning && (
        <div className="cyber-card flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-cyan-400">
              {getFileType(file) === 'image' && <ImageIcon />}
              {getFileType(file) === 'audio' && <Music />}
              {getFileType(file) === 'video' && <Video />}
            </div>
            <div>
              <p className="text-white font-bold">{file.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB // Payload Ready</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setFile(null)} className="p-3 text-slate-500 hover:text-red-400 transition-colors">
              <X size={20} />
            </button>
            <button onClick={startScan} className="cyber-button">
              Initiate Probe
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cyber-card relative py-24 text-center overflow-hidden"
          >
            {getFileType(file) === 'image' && <div className="scanner-line" />}
            
            <div className="relative z-10 space-y-12">
              {getFileType(file) === 'audio' ? (
                 <div className="flex items-center justify-center gap-1 h-20">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [20, 60, 20] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                        className="w-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      />
                    ))}
                 </div>
              ) : (
                <Activity className="w-16 h-16 text-cyan-500 mx-auto animate-pulse" />
              )}
              
              <div>
                <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-[0.4em] mb-2">Neural Extraction Active</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Decoding file structure // isolating anomalies</p>
              </div>
            </div>
          </motion.div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Metadata Integrity */}
            <div className="cyber-card border-t-2 border-t-blue-500/50">
              <div className="flex items-center gap-3 mb-8 text-blue-400">
                <Terminal className="w-5 h-5" />
                <h4 className="font-black uppercase tracking-widest text-xs">Metadata Integrity</h4>
              </div>
              <div className="space-y-4 font-mono text-[11px] text-slate-400">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="flex items-center gap-2"><Camera size={12}/> DEVICE</span>
                  <span className="text-blue-300 font-bold uppercase">{results.metadata.camera}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                   <span className="flex items-center gap-2"><Calendar size={12}/> TIMESTAMP</span>
                  <span className="text-blue-300 font-bold uppercase">{results.metadata.date}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                   <span className="flex items-center gap-2"><MapPin size={12}/> GEO_TAG</span>
                  <span className="text-blue-300 font-bold uppercase">{results.metadata.gps}</span>
                </div>
                <div className="bg-black/30 p-3 rounded border border-white/5 mt-4">
                  <p className="text-[10px] text-slate-600 mb-1">EDIT_HISTORY_DETECTED</p>
                  <p className="text-red-400 uppercase font-black tracking-tighter">{results.metadata.software}</p>
                </div>
              </div>
            </div>

            {/* Visual Anomaly Heatmap */}
            <div className="cyber-card border-t-2 border-t-fuchsia-500/50">
              <div className="flex items-center gap-3 mb-8 text-fuchsia-400">
                <Activity className="w-5 h-5" />
                <h4 className="font-black uppercase tracking-widest text-xs">Visual Anomaly Heatmap</h4>
              </div>
              <div className="relative aspect-video rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
                  alt="Forensic ELA" 
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 bg-red-600/30 rounded-full blur-2xl animate-pulse"></div>
                   <div className="w-12 h-12 bg-red-600/50 rounded-full blur-xl absolute top-1/3 left-1/4 animate-pulse delay-500"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-4 left-4 text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest">ELA // Tamper Detection Level High</span>
              </div>
            </div>

            {/* Acoustic Fingerprint */}
            <div className="cyber-card border-t-2 border-t-lime-500/50">
              <div className="flex items-center gap-3 mb-8 text-lime-400">
                <Fingerprint className="w-5 h-5" />
                <h4 className="font-black uppercase tracking-widest text-xs">Acoustic Fingerprint</h4>
              </div>
              <div className="space-y-6">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Neural Transcript (Whisper v3)</p>
                  <p className="text-sm text-slate-300 italic">"{results.transcript}"</p>
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synthetic Probability</span>
                      <span className="text-lime-400 font-bold">{results.syntheticProbability}%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${results.syntheticProbability}%` }}
                        className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]"
                      />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
