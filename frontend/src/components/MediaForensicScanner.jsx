import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Terminal, Fingerprint, Activity,
  AlertTriangle, CheckCircle, Search, Loader2,
  FileWarning, Clock, HardDrive, Tag, Sparkles, RefreshCw, Info, Link2
} from 'lucide-react';
import exifr from 'exifr';
import axios from 'axios';
import { verifyClaim } from '../api';

const API_BASE = 'http://localhost:8000';

const getFileType = (f) => {
  if (f.type.startsWith('image/')) return 'image';
  if (f.type.startsWith('audio/')) return 'audio';
  if (f.type.startsWith('video/')) return 'video';
  return 'unknown';
};

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const MediaForensicScanner = () => {
  const [inputMode, setInputMode]   = useState('file'); // 'file' | 'url'
  const [urlInput, setUrlInput]     = useState('');
  const [isUrlLoading, setUrlLoad]  = useState(false);
  const [urlError, setUrlError]     = useState(null);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [isHovering, setHover]      = useState(false);
  const [exifData, setExifData]     = useState(null);
  const [isExtracting, setExtracting]   = useState(false);
  const [claimText, setClaimText]       = useState('');
  const [extractError, setExtractError] = useState(null);
  const [isVerifying, setVerifying]     = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError]   = useState(null);
  const [sourceLabel, setSourceLabel]   = useState('');  // what was scanned

  // ── File selected ─────────────────────────────────────────────────────
  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setExifData(null);
    setClaimText('');
    setVerifyResult(null);
    setVerifyError(null);
    setExtractError(null);

    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }

    // Passive EXIF read – just for info, no scoring
    exifr.parse(selectedFile, { pick: ['Make', 'Model', 'DateTimeOriginal', 'Software', 'GPSLatitude', 'GPSLongitude'] })
      .then(exif => setExifData(exif || {}))
      .catch(() => setExifData({}));

    // Auto-extract claim via Groq
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const res = await axios.post(`${API_BASE}/api/media/extract`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setClaimText(res.data.claim || '');
    } catch {
      setExtractError('Groq could not read this file automatically. Type the claim below manually.');
    } finally {
      setExtracting(false);
    }
  };

  const reExtract = async () => {
    if (!file) return;
    setExtracting(true); setExtractError(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await axios.post(`${API_BASE}/api/media/extract`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setClaimText(res.data.claim || '');
    } catch { setExtractError('Re-extraction failed. Type the claim manually.'); }
    finally { setExtracting(false); }
  };

  const handleVerify = async () => {
    if (!claimText.trim()) return;
    setVerifying(true); setVerifyError(null); setVerifyResult(null);
    try {
      const data = await verifyClaim(claimText);
      setVerifyResult(data);
    } catch { setVerifyError('AI Engine unreachable. Ensure the backend is running.'); }
    finally { setVerifying(false); }
  };

  const reset = () => {
    setFile(null); setPreview(null); setExifData(null);
    setClaimText(''); setVerifyResult(null); setVerifyError(null);
    setExtractError(null); setUrlInput(''); setUrlError(null);
    setSourceLabel('');
  };

  // ── URL submission ────────────────────────────────────────────────────
  const handleUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlError(null); setClaimText(''); setVerifyResult(null); setVerifyError(null);
    setUrlLoad(true); setSourceLabel(url);
    try {
      const res = await axios.post(`${API_BASE}/api/media/extract-url`, { url });
      setClaimText(res.data.claim || '');
      // Mark file as 'url mode' so the panel opens
      setFile({ name: url, size: 0, lastModified: Date.now(), type: 'url', _isUrl: true });
    } catch (err) {
      const detail = err?.response?.data?.detail || 'URL extraction failed. Try a direct video link.';
      setUrlError(detail);
    } finally {
      setUrlLoad(false);
    }
  };

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
              Upload media → Groq AI reads claim → Verify against global sources
            </p>
          </div>
        </div>
        {file && (
          <button onClick={reset} className="p-3 text-slate-500 hover:text-red-400 transition-colors" title="Reset">
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── INPUT ZONE (File or URL) ── */}
      {!file && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* Tab Switcher */}
          <div className="flex gap-2 p-1 bg-slate-900/60 border border-white/5 rounded-2xl w-fit">
            <button
              onClick={() => setInputMode('file')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                inputMode === 'file'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Upload size={14} /> Upload File
            </button>
            <button
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                inputMode === 'url'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Link2 size={14} /> Video URL
            </button>
          </div>

          {/* File Upload Panel */}
          {inputMode === 'file' && (
            <div
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onDragOver={(e) => { e.preventDefault(); setHover(true); }}
              onDragLeave={() => setHover(false)}
              onDrop={(e) => { e.preventDefault(); setHover(false); handleFile(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center transition-all duration-500 ${
                isHovering ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_60px_rgba(34,211,238,0.12)]' : 'border-slate-800 bg-slate-900/30'
              }`}
            >
              <Upload className={`w-14 h-14 mb-5 transition-colors duration-500 ${isHovering ? 'text-cyan-400' : 'text-slate-600'}`} />
              <h3 className="text-xl font-bold text-slate-200 mb-2">Drop Viral Media Here</h3>
              <p className="text-slate-500 text-sm mb-1 text-center">Memes · Screenshots · News images · Audio · Video</p>
              <p className="text-slate-600 text-[10px] font-mono mb-8 uppercase tracking-widest">
                Groq AI reads the claim — verdict from global sources
              </p>
              <label className="cyber-button cursor-pointer">
                <Upload className="w-4 h-4" /> Select File
                <input type="file" className="hidden" accept="image/*,audio/*,video/*" onChange={(e) => handleFile(e.target.files[0])} />
              </label>
            </div>
          )}

          {/* URL Input Panel */}
          {inputMode === 'url' && (
            <div className="cyber-card border-t-2 border-t-cyan-500/50 space-y-5">
              <div className="flex items-center gap-3">
                <Link2 className="text-cyan-400 w-5 h-5" />
                <div>
                  <h3 className="text-white font-black uppercase tracking-wider text-sm">Paste Video / News Link</h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-0.5">YouTube · Twitter/X · Instagram Reels · Direct MP4</p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrl()}
                  placeholder="https://youtube.com/watch?v=... or any video URL"
                  className="cyber-input !min-h-0 py-3 flex-1 text-sm"
                />
                <button
                  onClick={handleUrl}
                  disabled={!urlInput.trim() || isUrlLoading}
                  className="cyber-button px-6 shrink-0"
                >
                  {isUrlLoading
                    ? <><Loader2 className="animate-spin w-4 h-4" /> Fetching...</>
                    : <><Search className="w-4 h-4" /> Analyze</>
                  }
                </button>
              </div>

              {isUrlLoading && (
                <div className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <Loader2 className="animate-spin text-cyan-400 w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-cyan-300 font-bold text-sm">Downloading & transcribing video...</p>
                    <p className="text-slate-500 text-xs mt-0.5">yt-dlp → Groq Whisper → Claim extraction</p>
                  </div>
                </div>
              )}

              {urlError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest">
                  {urlError}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  'https://www.youtube.com/watch?v=...',
                  'https://twitter.com/...',
                  'https://www.instagram.com/reel/...',
                ].map(ex => (
                  <span key={ex} className="text-[9px] font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded border border-white/5">{ex}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}


      {/* ── MAIN PANEL ── */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* LEFT: Media Preview + Neutral File Info */}
          <div className="lg:col-span-5 space-y-6">

            {/* Preview */}
            {preview && (
              <div className="cyber-card p-0 overflow-hidden relative rounded-2xl">
                <img src={preview} alt="Uploaded" className="w-full object-contain max-h-[320px]" />
              </div>
            )}

            {/* File Info — NEUTRAL, no risk score */}
            <div className="cyber-card border-t-2 border-t-slate-600/50">
              <div className="flex items-center gap-2 mb-5 text-slate-400">
                <Terminal className="w-4 h-4" />
                <h4 className="font-black uppercase tracking-widest text-xs">File Information</h4>
              </div>
              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                <MetaRow icon={<Tag size={10}/>}       label="NAME"     value={file.name} />
                <MetaRow icon={<HardDrive size={10}/>} label="SIZE"     value={formatBytes(file.size)} />
                <MetaRow icon={<Clock size={10}/>}     label="MODIFIED" value={new Date(file.lastModified).toUTCString()} />
                {exifData?.Make && (
                  <MetaRow label="CAMERA" value={`${exifData.Make} ${exifData.Model || ''}`.trim()} highlight />
                )}
                {exifData?.Software && (
                  <MetaRow label="SOFTWARE" value={exifData.Software} highlight />
                )}
              </div>

              {/* Honest disclaimer */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-start gap-2 text-slate-500">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-500/60" />
                <p className="text-[10px] leading-relaxed">
                  File metadata alone does <span className="text-white font-bold">not</span> indicate whether content is true or false.
                  Verdict is determined only by <span className="text-cyan-400 font-bold">AI claim verification</span> against live global sources.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Groq Claim Extraction + AI Verify */}
          <div className="lg:col-span-7 space-y-6">

            {/* Claim extraction box */}
            <div className="cyber-card border-t-2 border-t-cyan-500/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="font-black uppercase tracking-widest text-xs">Groq AI · Claim Extraction</h4>
                </div>
                {!isExtracting && file && (
                  <button onClick={reExtract} title="Re-extract" className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors">
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>

              {isExtracting ? (
                <div className="flex items-center gap-3 p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <Loader2 className="animate-spin text-cyan-400 w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-cyan-300 font-bold text-sm">Reading media with Groq Vision...</p>
                    <p className="text-slate-500 text-xs mt-0.5">Extracting only the core verifiable claim</p>
                  </div>
                </div>
              ) : (
                <div>
                  {extractError && (
                    <p className="text-amber-400 text-xs font-bold mb-3 uppercase tracking-widest">{extractError}</p>
                  )}
                  {claimText && (
                    <p className="text-[9px] text-cyan-500 font-black uppercase tracking-widest mb-2">
                      ✦ Auto-extracted — review and edit if needed
                    </p>
                  )}
                  <textarea
                    value={claimText}
                    onChange={(e) => setClaimText(e.target.value)}
                    placeholder="AI will extract the key claim from your media automatically..."
                    className="cyber-input min-h-[140px] text-base leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Verify button */}
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
                    : <><Search className="w-4 h-4" /> Verify This Claim</>
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
                    <p className="text-xs text-slate-500 uppercase tracking-widest animate-pulse">
                      Cross-referencing against global intelligence sources...
                    </p>
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
                          { label: 'Fear Language',         value: verifyResult.risk_metrics.fear_level,        color: '#f87171' },
                          { label: 'Urgency Patterns',      value: verifyResult.risk_metrics.urgency_level,     color: '#fbbf24' },
                          { label: 'Conspiracy Indicators', value: verifyResult.risk_metrics.conspiracy_level,  color: '#c084fc' },
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
                    <button onClick={() => setVerifyResult(null)} className="cyber-button flex-1 justify-center">← Edit & Re-verify</button>
                    <button onClick={reset} className="cyber-button flex-1 justify-center">New Scan</button>
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
const MetaRow = ({ icon, label, value, highlight }) => (
  <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2 last:border-0">
    <span className="flex items-center gap-1.5 text-slate-500 shrink-0 uppercase tracking-wider">{icon} {label}</span>
    <span className={`font-bold text-right break-all ${highlight ? 'text-slate-300' : 'text-cyan-300'}`}>{value || 'N/A'}</span>
  </div>
);

const getVerdictColor  = (v = '') => v.includes('TRUE') ? 'text-lime-400' : v.includes('FALSE') ? 'text-red-400' : v.includes('MIXED') ? 'text-amber-400' : 'text-slate-400';
const getVerdictBorder = (v = '') => v.includes('TRUE') ? 'border-lime-500' : v.includes('FALSE') ? 'border-red-500' : v.includes('MIXED') ? 'border-amber-500' : 'border-slate-500';
const getVerdictIcon   = (v = '') => {
  if (v.includes('TRUE'))  return <CheckCircle   className="w-12 h-12 text-lime-400 shrink-0" />;
  if (v.includes('FALSE')) return <FileWarning   className="w-12 h-12 text-red-400 shrink-0" />;
  if (v.includes('MIXED')) return <AlertTriangle className="w-12 h-12 text-amber-400 shrink-0" />;
  return <Activity className="w-12 h-12 text-slate-400 shrink-0" />;
};
