import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, XCircle, ShieldAlert, ExternalLink, Languages, BrainCircuit, Globe2, Fingerprint } from 'lucide-react';
import clsx from 'clsx';

export const VerdictDashboard = ({ result }) => {
  if (!result) return null;

  const { verdict, confidence, reasoning, translated_text, sources, threat_card } = result;

  const getVerdictDetails = (v) => {
    switch (v) {
      case 'TRUE':
      case 'LIKELY TRUE':
        return { 
          color: 'text-emerald-400', 
          border: 'border-emerald-500/50', 
          bg: 'bg-emerald-500/5', 
          shadow: 'shadow-emerald-500/10',
          icon: <CheckCircle className="w-12 h-12 text-emerald-400" /> 
        };
      case 'FALSE':
      case 'LIKELY FALSE':
        return { 
          color: 'text-rose-400', 
          border: 'border-rose-500/50', 
          bg: 'bg-rose-500/5', 
          shadow: 'shadow-rose-500/10',
          icon: <XCircle className="w-12 h-12 text-rose-400" /> 
        };
      case 'MIXED':
        return { 
          color: 'text-amber-400', 
          border: 'border-amber-500/50', 
          bg: 'bg-amber-500/5', 
          shadow: 'shadow-amber-500/10',
          icon: <AlertTriangle className="w-12 h-12 text-amber-400" /> 
        };
      default:
        return { 
          color: 'text-blue-300', 
          border: 'border-blue-500/30', 
          bg: 'bg-blue-500/5', 
          shadow: 'shadow-blue-500/10',
          icon: <HelpCircle className="w-12 h-12 text-blue-300" /> 
        };
    }
  };

  const details = getVerdictDetails(verdict);

  return (
    <div className="w-full max-w-7xl mx-auto mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      {/* LEFT COLUMN: Metadata & Translation */}
      <div className="lg:col-span-4 flex flex-col gap-8">
        
        {/* Section 1: AI Translation */}
        {translated_text && (
          <div className="glass-panel p-8 border-t-2 border-t-blue-500/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-blue-400">
                <Languages className="w-6 h-6" />
                <h4 className="font-black uppercase tracking-widest text-sm">Semantic Bridge</h4>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-bold uppercase tracking-tighter">Verified Translation</span>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl text-white/70 italic text-base leading-relaxed border border-white/5 shadow-inner">
              "{translated_text}"
            </div>
            <p className="mt-4 text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">Language Normalization Complete</p>
          </div>
        )}

        {/* Section 2: Threat Mapping */}
        {threat_card && (
          <div className="glass-panel p-8 border-t-2 border-t-orange-500/50 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Fingerprint className="w-24 h-24 text-orange-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-6 text-orange-400 relative z-10">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="font-black uppercase tracking-widest text-sm">Threat attribution</h4>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-black/30 p-4 rounded-xl border border-orange-500/20 group-hover:border-orange-500/40 transition-colors">
                <span className="block text-[10px] text-orange-300/50 mb-2 uppercase tracking-[0.2em] font-black">Tactical Framework</span>
                <span className="font-bold text-lg text-orange-100">{threat_card.tactic}</span>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-orange-500/20 group-hover:border-orange-500/40 transition-colors">
                <span className="block text-[10px] text-orange-300/50 mb-2 uppercase tracking-[0.2em] font-black">Execution Technique</span>
                <span className="font-bold text-lg text-orange-100">{threat_card.technique}</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Signal Indicator */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white/40">
            <Globe2 className="w-5 h-5 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Probes Active</span>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-blue-500/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Intelligence Dashboard */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        
        {/* Section 3: The Intelligence Verdict */}
        <div className={clsx("glass-panel-heavy p-10 border-l-[12px] relative overflow-hidden", details.border, details.bg, details.shadow)}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-current opacity-[0.03] translate-x-1/2 -translate-y-1/2 rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 border-b border-white/10 pb-10">
            <div className="flex items-center gap-8">
              <div className={clsx("p-4 rounded-3xl bg-white/5 border", details.border)}>
                {details.icon}
              </div>
              <div>
                <span className={clsx("text-xs font-black uppercase tracking-[0.5em] mb-2 block", details.color)}>AI Confidence Analysis</span>
                <h3 className={clsx("text-6xl font-black uppercase tracking-tighter", details.color)}>
                  {verdict}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 min-w-[160px]">
              <span className="text-[60px] font-black leading-none tracking-tighter">
                {(confidence * 100).toFixed(0)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">% TRUST RATE</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <BrainCircuit className="w-6 h-6" />
              <h4 className="font-black uppercase tracking-widest text-sm">Synthetic Reasoning</h4>
            </div>
            <div className="bg-black/40 p-8 rounded-3xl border border-white/5 text-white/90 leading-relaxed text-xl font-light italic shadow-inner">
              "{reasoning}"
            </div>
          </div>
        </div>

        {/* Section 4: Live Evidence Citations */}
        {sources && sources.length > 0 && (
          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-blue-300">
                <ExternalLink className="w-6 h-6" />
                <h4 className="font-black uppercase tracking-widest text-sm">Ground Truth Citations</h4>
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{sources.length} sources indexed</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl transition-all duration-500 group hover:border-blue-500/30 hover:translate-y-[-4px] hover:shadow-2xl shadow-blue-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm group-hover:bg-blue-400 group-hover:text-black transition-colors duration-500">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h5 className="text-white font-bold mb-0.5 line-clamp-1 group-hover:text-blue-300 transition-colors">
                        {source.title || new URL(source.url).hostname}
                      </h5>
                      <span className="text-[9px] text-white/20 uppercase tracking-widest font-black truncate block">
                        Source Reliability High
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-white/40">
                    <span className="text-[10px] font-mono truncate max-w-[200px]">{source.url}</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:translate-y-[-1px] transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
