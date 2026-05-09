import React from 'react';
import {
  AlertTriangle, CheckCircle, HelpCircle, XCircle,
  ShieldAlert, ExternalLink, Languages, BrainCircuit,
  Fingerprint, Activity, Zap, TrendingUp
} from 'lucide-react';
import clsx from 'clsx';

export const VerdictDashboard = ({ result }) => {
  if (!result) return null;

  const { verdict, confidence, reasoning, translated_text, sources, threat_card, risk_metrics, stance, emotional_tone } = result;

  const getVerdictDetails = (v = '') => {
    const u = v.toUpperCase();
    if (u.includes('LIKELY TRUE') || u === 'TRUE')
      return { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/5', glow: 'shadow-emerald-500/20', icon: <CheckCircle className="w-12 h-12 text-emerald-400" /> };
    if (u.includes('LIKELY FALSE') || u === 'FALSE')
      return { color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/5', glow: 'shadow-rose-500/20', icon: <XCircle className="w-12 h-12 text-rose-400" /> };
    if (u === 'MIXED')
      return { color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/5', glow: 'shadow-amber-500/20', icon: <AlertTriangle className="w-12 h-12 text-amber-400" /> };
    return { color: 'text-blue-300', border: 'border-blue-500/30', bg: 'bg-blue-500/5', glow: 'shadow-blue-500/20', icon: <HelpCircle className="w-12 h-12 text-blue-300" /> };
  };

  const details = getVerdictDetails(verdict);

  const riskItems = risk_metrics ? [
    { label: 'Fear Level', value: risk_metrics.fear_level ?? 0, color: '#f87171' },
    { label: 'Urgency Level', value: risk_metrics.urgency_level ?? 0, color: '#fbbf24' },
    { label: 'Conspiracy Level', value: risk_metrics.conspiracy_level ?? 0, color: '#c084fc' },
    { label: 'Total Risk', value: risk_metrics.total_risk_score ?? 0, color: '#22d3ee' },
  ] : [];

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 px-4 pb-20">

      {/* ── TOP: Verdict Banner ── */}
      <div className={clsx('glass-panel-heavy p-8 md:p-10 border-l-8 relative overflow-hidden', details.border, details.bg)}>
        <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-white to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Verdict + Icon */}
          <div className="flex items-center gap-6">
            <div className={clsx('p-4 rounded-2xl bg-white/5 border shrink-0', details.border)}>
              {details.icon}
            </div>
            <div>
              <span className={clsx('text-[10px] font-black uppercase tracking-[0.5em] block mb-1 opacity-70', details.color)}>
                AI Intelligence Verdict
              </span>
              <h3 className={clsx('text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none', details.color)}>
                {verdict}
              </h3>
              {stance && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stance:</span>
                  <span className="text-xs font-bold text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">{stance}</span>
                  {emotional_tone && (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tone:</span>
                      <span className="text-xs font-bold text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">{emotional_tone}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 min-w-[150px] shrink-0">
            <span className={clsx('text-5xl font-black leading-none tracking-tighter', details.color)}>
              {(confidence * 100).toFixed(0)}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-2">% Trust Rate</span>
          </div>
        </div>

        {/* Reasoning */}
        <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4 text-purple-400">
            <BrainCircuit className="w-5 h-5" />
            <h4 className="font-black uppercase tracking-widest text-xs">Synthetic Reasoning</h4>
          </div>
          <p className="text-white/85 leading-relaxed text-base md:text-lg font-light italic">
            &ldquo;{reasoning}&rdquo;
          </p>
        </div>
      </div>

      {/* ── MIDDLE ROW: Risk Metrics + Translation + Threat ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Risk Metrics — always shown */}
        {riskItems.length > 0 && (
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-6 text-cyan-400">
              <Activity className="w-5 h-5" />
              <h4 className="font-black uppercase tracking-widest text-xs">Linguistic Risk Profile</h4>
            </div>
            <div className="space-y-4">
              {riskItems.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-xs font-black" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Translation — shown only if non-English input */}
        {translated_text && (
          <div className="glass-panel p-6 border-t-2 border-t-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Languages className="w-5 h-5" />
                <h4 className="font-black uppercase tracking-widest text-xs">Semantic Bridge</h4>
              </div>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-bold uppercase tracking-tighter">Translated</span>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-white/70 italic text-sm leading-relaxed border border-white/5" dir="auto">
              &ldquo;{translated_text}&rdquo;
            </div>
            <p className="mt-3 text-[9px] text-white/20 font-bold uppercase tracking-widest text-center">Language Normalization Complete</p>
          </div>
        )}

        {/* Threat Attribution — shown only if threat detected */}
        {threat_card && (
          <div className="glass-panel p-6 border-t-2 border-t-orange-500/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Fingerprint className="w-20 h-20 text-orange-500" />
            </div>
            <div className="flex items-center gap-2 mb-4 text-orange-400 relative z-10">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-black uppercase tracking-widest text-xs">Threat Attribution</h4>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="bg-black/30 p-3 rounded-xl border border-orange-500/20">
                <span className="block text-[9px] text-orange-300/50 mb-1 uppercase tracking-widest font-black">Tactical Framework</span>
                <span className="font-bold text-orange-100">{threat_card.tactic}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-orange-500/20">
                <span className="block text-[9px] text-orange-300/50 mb-1 uppercase tracking-widest font-black">Execution Technique</span>
                <span className="font-bold text-orange-100">{threat_card.technique}</span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback card if no translation and no threat — show a summary tile */}
        {!translated_text && !threat_card && (
          <div className="glass-panel p-6 flex flex-col justify-center items-center text-center gap-3">
            <div className="p-3 bg-lime-500/10 rounded-xl border border-lime-500/20">
              <Zap className="w-5 h-5 text-lime-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Input Language</span>
            <span className="text-sm font-bold text-white">English Detected</span>
            <span className="text-[10px] text-slate-500 leading-relaxed">No translation required. Claim analyzed directly in source language.</span>
          </div>
        )}
      </div>

      {/* ── BOTTOM: Evidence Sources ── */}
      {sources && sources.length > 0 && (
        <div className="glass-panel p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-blue-300">
              <TrendingUp className="w-5 h-5" />
              <h4 className="font-black uppercase tracking-widest text-xs">Ground Truth Citations</h4>
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{sources.length} sources indexed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all duration-300 group hover:border-blue-500/30 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs group-hover:bg-blue-400 group-hover:text-black transition-colors shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h5 className="text-white text-sm font-bold line-clamp-1 group-hover:text-blue-300 transition-colors">
                      {source.title || (() => { try { return new URL(source.url).hostname; } catch { return source.url; } })()}
                    </h5>
                  </div>
                </div>
                <div className="flex items-center justify-between text-white/30 mt-1">
                  <span className="text-[10px] font-mono truncate max-w-[180px]">{source.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 group-hover:text-blue-400 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
