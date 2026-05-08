import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, XCircle, ShieldAlert, ExternalLink, Languages, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';

export const VerdictDashboard = ({ result }) => {
  if (!result) return null;

  const { verdict, confidence, reasoning, translated_text, sources, threat_card } = result;

  const getVerdictDetails = (v) => {
    switch (v) {
      case 'TRUE':
      case 'LIKELY TRUE':
        return { color: 'text-green-400', border: 'border-green-400/50', bg: 'bg-green-400/10', icon: <CheckCircle className="w-10 h-10 text-green-400" /> };
      case 'FALSE':
      case 'LIKELY FALSE':
        return { color: 'text-red-400', border: 'border-red-400/50', bg: 'bg-red-400/10', icon: <XCircle className="w-10 h-10 text-red-400" /> };
      case 'MIXED':
        return { color: 'text-yellow-400', border: 'border-yellow-400/50', bg: 'bg-yellow-400/10', icon: <AlertTriangle className="w-10 h-10 text-yellow-400" /> };
      default:
        return { color: 'text-gray-300', border: 'border-gray-400/50', bg: 'bg-gray-400/10', icon: <HelpCircle className="w-10 h-10 text-gray-300" /> };
    }
  };

  const details = getVerdictDetails(verdict);

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Input Translation & Threat Intel */}
      <div className="flex flex-col gap-6 lg:col-span-1">
        
        {/* Section 1: Language Translation */}
        {translated_text && (
          <div className="glass-panel p-6 border-t-4 border-t-blue-400">
            <div className="flex items-center gap-2 mb-4 text-blue-300">
              <Languages className="w-6 h-6" />
              <h4 className="font-bold text-lg">AI Translation</h4>
            </div>
            <div className="bg-black/20 p-4 rounded-xl text-white/80 italic text-sm leading-relaxed border border-white/5">
              "{translated_text}"
            </div>
          </div>
        )}

        {/* Section 3: Threat Attribution */}
        {threat_card && (
          <div className="glass-panel p-6 border-t-4 border-t-orange-500">
            <div className="flex items-center gap-2 mb-4 text-orange-400">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="font-bold text-lg">Threat Attribution</h4>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-black/20 p-3 rounded-lg border border-orange-500/20">
                <span className="block text-xs text-orange-300/70 mb-1 uppercase tracking-wider">Tactic</span>
                <span className="font-semibold text-orange-100">{threat_card.tactic}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-lg border border-orange-500/20">
                <span className="block text-xs text-orange-300/70 mb-1 uppercase tracking-wider">Technique</span>
                <span className="font-semibold text-orange-100">{threat_card.technique}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Verdict & Evidence */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        
        {/* Section 2: The Verdict */}
        <div className={clsx("glass-panel p-8 border-l-8 flex flex-col gap-6", details.border, details.bg)}>
          <div className="flex items-center gap-6 border-b border-white/10 pb-6">
            {details.icon}
            <div>
              <h3 className={clsx("text-4xl font-extrabold uppercase tracking-widest", details.color)}>
                {verdict}
              </h3>
              <p className="text-sm font-medium mt-1 text-white/70">
                Confidence Score: <span className="text-white">{(confidence * 100).toFixed(1)}%</span>
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-3 text-white/90">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <h4 className="font-bold text-lg">AI Reasoning</h4>
            </div>
            <div className="bg-black/30 p-5 rounded-xl border border-white/10 text-white/80 leading-relaxed text-lg">
              {reasoning}
            </div>
          </div>
        </div>

        {/* Section 4: Evidence Citations */}
        {sources && sources.length > 0 && (
          <div className="glass-panel p-6">
            <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-blue-300" /> Evidence Citations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl transition-all duration-300 group hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.15)]"
                >
                  <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold group-hover:bg-blue-500/40">
                    {idx + 1}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h5 className="text-blue-300 group-hover:text-blue-200 font-semibold mb-1 line-clamp-2">
                      {source.title || new URL(source.url).hostname}
                    </h5>
                    <p className="text-xs text-white/40 truncate">
                      {source.url}
                    </p>
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
