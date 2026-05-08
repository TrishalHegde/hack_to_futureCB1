import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Music, Video, X,
  Terminal, Fingerprint, Activity, MapPin, Camera,
  Calendar, AlertTriangle, CheckCircle, Search, Loader2,
  FileWarning, Clock, HardDrive, Tag
} from 'lucide-react';
import exifr from 'exifr';
import { verifyClaim } from '../api';

// ─── Helpers ──────────────────────────────────────────────────────────────
const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  return 'unknown';
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ─── Main Component ───────────────────────────────────────────────────────
export const MediaForensicScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [phase, setPhase] = useState('upload'); // upload | metadata | verify | results
  const [exifData, setExifData] = useState(null);
  const [claimText, setClaimText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  // ── File selected ──
  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setExifData(null);
    setVerifyResult(null);
    setVerifyError(null);
    setClaimText('');

    // Preview for images
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }

    // Extract REAL EXIF data
    try {
      const exif = await exifr.parse(selectedFile, {
        pick: ['Make', 'Model', 'DateTimeOriginal', 'GPSLatitude', 'GPSLongitude',
               'Software', 'Orientation', 'XResolution', 'YResolution',
               'ColorSpace', 'PixelXDimension', 'PixelYDimension', 'Flash'],
        translateValues: true,
      });
      setExifData(exif || {});
    } catch {
      setExifData({});
    }

    setPhase('metadata');
  };

  // ── Run AI Verify ──
  const handleVerify = async () => {
    if (!claimText.trim()) return;
    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    setPhase('verify');
    try {
      const data = await verifyClaim(claimText);
      setVerifyResult(data);
      setPhase('results');
    } catch (err) {
      setVerifyError('AI Engine failed to respond. Check that the backend is running.');
      setPhase('metadata');
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setExifData(null);
    setClaimText('');
    setVerifyResult(null);
    setVerifyError(null);
    setPhase('upload');
  };

  // ─── Derived metadata flags ───────────────────────────────────────────
  const hasCamera = exifData && (exifData.Make || exifData.Model);
  const hasSoftware = exifData && exifData.Software;
  const hasGPS = exifData && exifData.GPSLatitude;
  const isScreenshot = !hasCamera && file?.type.startsWith('image/');

  const metadataRisk = hasSoftware ? 80 : isScreenshot ? 60 : 20;

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
              Upload viral media → Extract metadata → Verify claim
            </p>
          </div>
        </div>
        {file && (
          <button onClick={reset} className="p-3 text-slate-500 hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── PHASE: Upload ── */}
      {phase === 'upload' && (
        <motion.div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={(e) => { e.preventDefault(); setIsHovering(false); handleFile(e.dataTransfer.files[0]); }}
          className={`relative border-2 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer ${
            isHovering
              ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_50px_rgba(34,211,238,0.1)]'
              : 'border-slate-800 bg-slate-900/30'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Upload className={`w-16 h-16 mb-6 transition-colors duration-500 ${isHovering ? 'text-cyan-400' : 'text-slate-600'}`} />
          <h3 className="text-xl font-bold text-slate-200 mb-2">Drop Suspicious Media Here</h3>
          <p className="text-slate-500 text-sm mb-2 font-mono uppercase tracking-widest text-center">
            Drag viral images, screenshots, memes, audio or video
          </p>
          <p className="text-slate-600 text-[10px] font-mono mb-8">Supports .JPG .PNG .MP4 .MP3 .WAV .WEBP</p>
          <label className="cyber-button cursor-pointer">
            <Upload className="w-4 h-4" /> Select File
            <input type="file" className="hidden" accept="image/*,audio/*,video/*" onChange={(e) => handleFile(e.target.files[0])} />
          </label>
        </motion.div>
      )}

      {/* ── PHASE: Metadata + Claim Entry ── */}
      {(phase === 'metadata' || phase === 'results') && file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left: Image Preview + File Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Preview */}
            {preview && (
              <div className="cyber-card p-0 overflow-hidden relative">
                <img src={preview} alt="Uploaded media" className="w-full object-contain max-h-80" />
                {isScreenshot && (
                  <div className="absolute top-3 right-3 bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">
                    Screenshot / Meme Detected
                  </div>
                )}
                {hasSoftware && (
                  <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">
                    Editing Software Trace
                  </div>
                )}
              </div>
            )}

            {/* Real File Metadata */}
            <div className="cyber-card border-t-2 border-t-blue-500/50">
              <div className="flex items-center gap-2 mb-5 text-blue-400">
                <Terminal className="w-4 h-4" />
                <h4 className="font-black uppercase tracking-widest text-xs">Metadata Integrity</h4>
              </div>
              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                <MetaRow icon={<HardDrive size={11}/>} label="FILE NAME" value={file.name} highlight="cyan" />
                <MetaRow icon={<Tag size={11}/>} label="TYPE" value={file.type || 'Unknown'} highlight="cyan" />
                <MetaRow icon={<HardDrive size={11}/>} label="SIZE" value={formatBytes(file.size)} highlight="cyan" />
                <MetaRow
                  icon={<Clock size={11}/>}
                  label="LAST MODIFIED"
                  value={new Date(file.lastModified).toUTCString()}
                  highlight="cyan"
                />
                {hasCamera ? (
                  <>
                    <MetaRow icon={<Camera size={11}/>} label="CAMERA" value={`${exifData.Make || ''} ${exifData.Model || ''}`.trim()} highlight="lime" />
                    <MetaRow icon={<Calendar size={11}/>} label="SHOT DATE" value={new Date(exifData.DateTimeOriginal).toUTCString()} highlight="lime" />
                  </>
                ) : file.type.startsWith('image/') ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg mt-2">
                    <p className="text-amber-400 font-black uppercase text-[10px] tracking-widest">⚠ No Camera EXIF Found</p>
                    <p className="text-slate-500 mt-1">Image was likely screenshotted or downloaded — original capture device cannot be verified.</p>
                  </div>
                ) : null}
                {hasSoftware && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg mt-2">
                    <p className="text-red-400 font-black uppercase text-[10px] tracking-widest mb-1">⚠ Edit History Detected</p>
                    <p className="text-red-300">{exifData.Software}</p>
                  </div>
                )}
                {hasGPS && (
                  <MetaRow icon={<MapPin size={11}/>} label="GPS" value={`${exifData.GPSLatitude?.toFixed(4)}°, ${exifData.GPSLongitude?.toFixed(4)}°`} highlight="lime" />
                )}
              </div>

              {/* Metadata Risk Meter */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest">
                  <span className="text-slate-500">Metadata Authenticity Risk</span>
                  <span className={metadataRisk >= 60 ? 'text-red-400' : 'text-lime-400'}>{metadataRisk}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metadataRisk}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${metadataRisk >= 60 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-lime-500'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Claim Verification */}
          <div className="lg:col-span-7 space-y-6">
            {/* Claim Entry */}
            {phase === 'metadata' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cyber-card border-t-2 border-t-cyan-500/50">
                <div className="flex items-center gap-2 mb-6 text-cyan-400">
                  <Search className="w-4 h-4" />
                  <h4 className="font-black uppercase tracking-widest text-xs">Step 2: Inject Claim for AI Verification</h4>
                </div>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  Type or paste the <span className="text-cyan-400 font-bold">text claim</span> visible in this media. 
                  The VAULTX AI engine will verify it against global intelligence sources.
                </p>
                <textarea
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="e.g. 'The Modi govt has launched the strongest attack on online fraud. WhatsApp must stay tied to an active SIM card...'"
                  className="cyber-input min-h-[160px] text-sm leading-relaxed mb-4"
                />
                {verifyError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold uppercase tracking-widest">
                    {verifyError}
                  </div>
                )}
                <button
                  onClick={handleVerify}
                  disabled={!claimText.trim() || isVerifying}
                  className="cyber-button w-full py-4 justify-center"
                >
                  {isVerifying
                    ? <><Loader2 className="animate-spin w-4 h-4" /> Probing Global Sources...</>
                    : <><Search className="w-4 h-4" /> Run AI Verification</>
                  }
                </button>
              </motion.div>
            )}

            {/* Scanning Animation */}
            {phase === 'verify' && (
              <div className="cyber-card relative py-20 text-center overflow-hidden">
                <div className="scanner-line" />
                <div className="relative z-10 space-y-6">
                  <Loader2 className="w-12 h-12 text-cyan-400 mx-auto animate-spin" />
                  <h3 className="text-xl font-black text-cyan-400 uppercase tracking-[0.3em]">Neural Probe Active</h3>
                  <div className="flex flex-col gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <p className="animate-pulse">Cross-referencing news repositories...</p>
                    <p className="animate-pulse delay-75">Analyzing linguistic patterns...</p>
                    <p className="animate-pulse delay-150">Synthesizing evidence verdict...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {phase === 'results' && verifyResult && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Verdict Banner */}
                <div className={`cyber-card border-l-8 ${getVerdictBorder(verifyResult.verdict)}`}>
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/5">
                    {getVerdictIcon(verifyResult.verdict)}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">AI Verdict</p>
                      <h3 className={`text-4xl font-black uppercase tracking-tighter ${getVerdictColor(verifyResult.verdict)}`}>
                        {verifyResult.verdict}
                      </h3>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Confidence</p>
                      <p className={`text-3xl font-black ${getVerdictColor(verifyResult.verdict)}`}>
                        {Math.round(verifyResult.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-base italic leading-relaxed">"{verifyResult.reasoning}"</p>
                </div>

                {/* Risk Metrics */}
                {verifyResult.risk_metrics && (
                  <div className="cyber-card">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-fuchsia-500" /> Linguistic Risk Profile
                    </h4>
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
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
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
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">
                      Evidence Sources ({verifyResult.sources.length})
                    </h4>
                    <div className="space-y-3">
                      {verifyResult.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start gap-3 p-3 bg-slate-950/80 hover:bg-slate-800/60 border border-white/5 rounded-xl transition-all group hover:border-cyan-500/30"
                        >
                          <span className="text-cyan-500 font-black text-sm mt-0.5">{i + 1}</span>
                          <div className="overflow-hidden">
                            <p className="text-slate-200 font-semibold text-sm line-clamp-1 group-hover:text-cyan-300">{src.title}</p>
                            <p className="text-[10px] text-slate-500 truncate font-mono">{src.url}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setPhase('metadata')} className="cyber-button w-full justify-center">
                  ← Edit Claim & Re-verify
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─── Utility Components ───────────────────────────────────────────────────
const MetaRow = ({ icon, label, value, highlight }) => (
  <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
    <span className="flex items-center gap-1.5 text-slate-500 shrink-0">{icon} {label}</span>
    <span className={`font-bold text-right break-all ${highlight === 'lime' ? 'text-lime-400' : 'text-cyan-300'}`}>{value || 'N/A'}</span>
  </div>
);

// ─── Verdict Helpers ──────────────────────────────────────────────────────
const getVerdictColor = (v = '') => {
  if (v.includes('TRUE')) return 'text-lime-400';
  if (v.includes('FALSE')) return 'text-red-400';
  if (v.includes('MIXED')) return 'text-amber-400';
  return 'text-slate-400';
};

const getVerdictBorder = (v = '') => {
  if (v.includes('TRUE')) return 'border-lime-500';
  if (v.includes('FALSE')) return 'border-red-500';
  if (v.includes('MIXED')) return 'border-amber-500';
  return 'border-slate-500';
};

const getVerdictIcon = (v = '') => {
  if (v.includes('TRUE')) return <CheckCircle className="w-10 h-10 text-lime-400 shrink-0" />;
  if (v.includes('FALSE')) return <FileWarning className="w-10 h-10 text-red-400 shrink-0" />;
  if (v.includes('MIXED')) return <AlertTriangle className="w-10 h-10 text-amber-400 shrink-0" />;
  return <Activity className="w-10 h-10 text-slate-400 shrink-0" />;
};
