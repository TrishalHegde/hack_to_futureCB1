import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ImageIcon, Music, Video, X,
  Terminal, Fingerprint, Activity, MapPin, Camera,
  Calendar, AlertTriangle, CheckCircle, Search, Loader2,
  FileWarning, Clock, HardDrive, Tag, Sparkles, RefreshCw
} from 'lucide-react';
import exifr from 'exifr';
import axios from 'axios';
import { verifyClaim } from '../api';

const API_BASE = 'http://localhost:8000';

const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return 'unknown';
};

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const MediaForensicScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  // States
  const [exifData, setExifData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);   // Groq extracting claim
  const [claimText, setClaimText] = useState('');
  const [extractError, setExtractError] = useState(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  // ── Handle file drop/select ──────────────────────────────────────────
  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setExifData(null);
    setClaimText('');
    setVerifyResult(null);
    setVerifyError(null);
    setExtractError(null);

    // Image preview
    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }

    // 1. Real EXIF extraction (runs in parallel with Groq)
    exifr.parse(selectedFile, {
      pick: ['Make', 'Model', 'DateTimeOriginal', 'GPSLatitude', 'GPSLongitude',
             'Software', 'XResolution', 'YResolution', 'PixelXDimension', 'PixelYDimension'],
      translateValues: true,
    }).then(exif => setExifData(exif || {})).catch(() => setExifData({}));

    // 2. Send to Groq for smart claim extraction
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await axios.post(`${API_BASE}/api/media/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setClaimText(res.data.claim || '');
    } catch (err) {
      setExtractError('Groq could not extract the claim. You can type it manually below.');
    } finally {
      setIsExtracting(false);
    }
  };

  // ── Re-extract claim ─────────────────────────────────────────────────
  const reExtract = async () => {
    if (!file) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_BASE}/api/media/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setClaimText(res.data.claim || '');
    } catch {
      setExtractError('Re-extraction failed. Type the claim manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  // ── Verify claim via AI ──────────────────────────────────────────────
  const handleVerify = async () => {
    if (!claimText.trim()) return;
    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    try {
      const data = await verifyClaim(claimText);
      setVerifyResult(data);
    } catch {
      setVerifyError('AI Engine failed. Make sure the backend is running.');
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setExifData(null);
    setClaimText(''); setVerifyResult(null);
    setVerifyError(null); setExtractError(null);
  };

  // Derived flags
  const hasCamera   = exifData && (exifData.Make || exifData.Model);
  const hasSoftware = exifData && exifData.Software;
  const hasGPS      = exifData && exifData.GPSLatitude;
  const isScreenshot = !hasCamera && file?.type.startsWith('image/');
  const metadataRisk = hasSoftware ? 85 : isScreenshot ? 65 : 20;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/30">
            <Fingerprint className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">
              Multimodal <span className="text-cyan-400">Forensics</span>
            </h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">
              Upload viral media → AI extracts claim → Verify globally
            </p>
          </div>
        </div>
        {file && (
          <button onClick={reset} className="p-3 text-slate-500 hover:text-red-400 transition-colors" title="Reset">
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── UPLOAD ZONE ── */}
      {!file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={(e) => { e.preventDefault(); setIsHovering(false); handleFile(e.dataTransfer.files[0]); }}
          className={`relative border-2 border-dashed rounded-3xl p-24 flex flex-col items-center justify-center transition-all duration-500 ${
            isHovering ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_60px_rgba(34,211,238,0.12)]' : 'border-slate-800 bg-slate-900/30'
          }`}
        >
          <Upload className={`w-16 h-16 mb-6 transition-colors duration-500 ${isHovering ? 'text-cyan-400' : 'text-slate-600'}`} />
          <h3 className="text-xl font-bold text-slate-200 mb-2">Drop Viral Media Here</h3>
          <p className="text-slate-500 text-sm mb-2 font-mono uppercase tracking-widest text-center">Memes · Screenshots · Videos · Audio clips</p>
          <p className="text-slate-600 text-[10px] font-mono mb-8">Groq AI will instantly extract the core claim</p>
          <label className="cyber-button cursor-pointer">
            <Upload className="w-4 h-4" /> Select File
            <input type="file" className="hidden" accept="image/*,audio/*,video/*" onChange={(e) => handleFile(e.target.files[0])} />
          </label>
        </motion.div>
      )}

      {/* ── MAIN ANALYSIS PANEL ── */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* LEFT: Preview + Metadata */}
          <div className="lg:col-span-5 space-y-6">

            {/* Preview */}
            {preview && (
              <div className="cyber-card p-0 overflow-hidden relative rounded-2xl">
                <img src={preview} alt="Uploaded" className="w-full object-contain max-h-72" />
                {isScreenshot && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Screenshot Detected
                  </span>
                )}
                {hasSoftware && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Edit Software Trace
                  </span>
                )}
              </div>
            )}

            {/* File Metadata */}
            <div className="cyber-card border-t-2 border-t-blue-500/50">
              <div className="flex items-center gap-2 mb-5 text-blue-400">
                <Terminal className="w-4 h-4" />
                <h4 className="font-black uppercase tracking-widest text-xs">Metadata Integrity</h4>
              </div>
              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                <MetaRow icon={<Tag size={10}/>}       label="FILE"     value={file.name} c="cyan" />
                <MetaRow icon={<HardDrive size={10}/>} label="SIZE"     value={formatBytes(file.size)} c="cyan" />
                <MetaRow icon={<Clock size={10}/>}     label="MODIFIED" value={new Date(file.lastModified).toUTCString()} c="cyan" />
                {hasCamera && (
                  <>
                    <MetaRow icon={<Camera size={10}/>}   label="CAMERA"    value={`${exifData.Make || ''} ${exifData.Model || ''}`.trim()} c="lime" />
                    {exifData.DateTimeOriginal && (
                      <MetaRow icon={<Calendar size={10}/>} label="SHOT DATE" value={new Date(exifData.DateTimeOriginal).toUTCString()} c="lime" />
                    )}
                  </>
                )}
                {hasGPS && (
                  <MetaRow icon={<MapPin size={10}/>} label="GPS" value={`${exifData.GPSLatitude?.toFixed(4)}°N ${exifData.GPSLongitude?.toFixed(4)}°E`} c="lime" />
                )}
              </div>

              {/* Flags */}
              {isScreenshot && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-amber-400 font-black uppercase text-[10px] tracking-widest">⚠ No Camera EXIF</p>
                  <p className="text-slate-500 text-xs mt-1">Image was screenshotted or downloaded. Original device unverifiable.</p>
                </div>
              )}
              {hasSoftware && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 font-black uppercase text-[10px] tracking-widest">⚠ Edit History Found</p>
                  <p className="text-red-300 text-xs mt-1">{exifData.Software}</p>
                </div>
              )}

              {/* Metadata Risk */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest">
                  <span className="text-slate-500">Metadata Risk</span>
                  <span className={metadataRisk >= 60 ? 'text-red-400' : 'text-lime-400'}>{metadataRisk}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${metadataRisk}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className={`h-full rounded-full ${metadataRisk >= 60 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-lime-500'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Claim Extraction + Verify */}
          <div className="lg:col-span-7 space-y-6">

            {/* Groq Extraction Card */}
            <div className="cyber-card border-t-2 border-t-cyan-500/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="font-black uppercase tracking-widest text-xs">Groq AI Claim Extraction</h4>
                </div>
                {!isExtracting && file && (
                  <button
                    onClick={reExtract}
                    title="Re-extract"
                    className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>

              {isExtracting ? (
                <div className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <Loader2 className="animate-spin text-cyan-400 w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-cyan-300 font-bold text-sm">Groq Vision Analyzing...</p>
                    <p className="text-slate-500 text-xs">Extracting only the core claim from your media</p>
                  </div>
                </div>
              ) : (
                <>
                  {extractError && (
                    <p className="text-amber-400 text-xs font-bold mb-3 uppercase tracking-widest">{extractError}</p>
                  )}
                  <div className="relative">
                    {claimText && (
                      <div className="absolute -top-2 left-3 px-2 bg-slate-900 text-[9px] font-black uppercase tracking-widest text-cyan-500">
                        Extracted Claim · Edit if needed
                      </div>
                    )}
                    <textarea
                      value={claimText}
                      onChange={(e) => setClaimText(e.target.value)}
                      placeholder="AI will extract the claim from your media automatically..."
                      className="cyber-input min-h-[140px] text-base leading-relaxed"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Verify Button */}
            {!verifyResult && (
              <div className="space-y-3">
                {verifyError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest">
                    {verifyError}
                  </div>
                )}
                <button
                  onClick={handleVerify}
                  disabled={!claimText.trim() || isVerifying || isExtracting}
                  className="cyber-button w-full justify-center py-4"
                >
                  {isVerifying
                    ? <><Loader2 className="animate-spin w-4 h-4" /> Probing Global Sources...</>
                    : <><Search className="w-4 h-4" /> Run AI Verification</>
                  }
                </button>
              </div>
            )}

            {/* Scanning animation */}
            <AnimatePresence>
              {isVerifying && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="cyber-card relative py-16 text-center overflow-hidden"
                >
                  <div className="scanner-line" />
                  <div className="relative z-10 space-y-4">
                    <Activity className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
                    <h3 className="text-lg font-black text-cyan-400 uppercase tracking-[0.3em]">Neural Probe Active</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest animate-pulse">Matching against global intelligence sources...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── RESULTS ── */}
            <AnimatePresence>
              {verifyResult && !isVerifying && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Verdict */}
                  <div className={`cyber-card border-l-8 ${getVerdictBorder(verifyResult.verdict)}`}>
                    <div className="flex items-center gap-6 mb-5 pb-5 border-b border-white/5">
                      {getVerdictIcon(verifyResult.verdict)}
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] mb-1">AI Verdict</p>
                        <h3 className={`text-5xl font-black uppercase tracking-tighter ${getVerdictColor(verifyResult.verdict)}`}>
                          {verifyResult.verdict}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Confidence</p>
                        <p className={`text-4xl font-black ${getVerdictColor(verifyResult.verdict)}`}>
                          {Math.round(verifyResult.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-base italic leading-relaxed">"{verifyResult.reasoning}"</p>
                  </div>

                  {/* Risk Meters */}
                  {verifyResult.risk_metrics && (
                    <div className="cyber-card">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-fuchsia-500" /> Linguistic Risk Profile
                      </p>
                      <div className="space-y-4">
                        {[
                          { label: 'Fear Language', value: verifyResult.risk_metrics.fear_level, color: '#f87171' },
                          { label: 'Urgency Patterns', value: verifyResult.risk_metrics.urgency_level, color: '#fbbf24' },
                          { label: 'Conspiracy Indicators', value: verifyResult.risk_metrics.conspiracy_level, color: '#c084fc' },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                              <span className="text-slate-400">{item.label}</span>
                              <span style={{ color: item.color }}>{item.value}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: item.color, boxShadow: `0 0 8px ${item.color}80` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {verifyResult.sources?.length > 0 && (
                    <div className="cyber-card">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                        Evidence Sources ({verifyResult.sources.length})
                      </p>
                      <div className="space-y-2">
                        {verifyResult.sources.map((src, i) => (
                          <a key={i} href={src.url} target="_blank" rel="noreferrer"
                            className="flex items-start gap-3 p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group"
                          >
                            <span className="text-cyan-500 font-black text-xs mt-0.5 shrink-0">{i + 1}</span>
                            <div className="overflow-hidden">
                              <p className="text-slate-200 font-semibold text-sm line-clamp-1 group-hover:text-cyan-300 transition-colors">{src.title}</p>
                              <p className="text-[10px] text-slate-500 truncate font-mono">{src.url}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={() => setVerifyResult(null)} className="cyber-button flex-1 justify-center">
                      ← Edit & Re-verify
                    </button>
                    <button onClick={reset} className="cyber-button flex-1 justify-center">
                      New Scan
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const MetaRow = ({ icon, label, value, c }) => (
  <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2 last:border-0">
    <span className="flex items-center gap-1.5 text-slate-500 shrink-0 uppercase tracking-wider">{icon} {label}</span>
    <span className={`font-bold text-right break-all ${c === 'lime' ? 'text-lime-400' : 'text-cyan-300'}`}>{value || 'N/A'}</span>
  </div>
);

const getVerdictColor  = (v = '') => v.includes('TRUE') ? 'text-lime-400' : v.includes('FALSE') ? 'text-red-400' : v.includes('MIXED') ? 'text-amber-400' : 'text-slate-400';
const getVerdictBorder = (v = '') => v.includes('TRUE') ? 'border-lime-500' : v.includes('FALSE') ? 'border-red-500' : v.includes('MIXED') ? 'border-amber-500' : 'border-slate-500';
const getVerdictIcon   = (v = '') => {
  if (v.includes('TRUE'))  return <CheckCircle  className="w-12 h-12 text-lime-400  shrink-0" />;
  if (v.includes('FALSE')) return <FileWarning  className="w-12 h-12 text-red-400   shrink-0" />;
  if (v.includes('MIXED')) return <AlertTriangle className="w-12 h-12 text-amber-400 shrink-0" />;
  return <Activity className="w-12 h-12 text-slate-400 shrink-0" />;
};
