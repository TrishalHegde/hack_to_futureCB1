import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, XCircle, ShieldAlert, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

export const VerdictDashboard = ({ result }) => {
  if (!result) return null;

  const { verdict, confidence, reasoning, sources, threat_card } = result;

  const getVerdictDetails = (v) => {
    switch (v) {
      case 'TRUE':
      case 'LIKELY TRUE':
        return { color: 'text-green-400', border: 'border-green-400/50', icon: <CheckCircle className="w-8 h-8 text-green-400" /> };
      case 'FALSE':
      case 'LIKELY FALSE':
        return { color: 'text-red-400', border: 'border-red-400/50', icon: <XCircle className="w-8 h-8 text-red-400" /> };
      case 'MIXED':
        return { color: 'text-yellow-400', border: 'border-yellow-400/50', icon: <AlertTriangle className="w-8 h-8 text-yellow-400" /> };
      default:
        return { color: 'text-gray-300', border: 'border-gray-400/50', icon: <HelpCircle className="w-8 h-8 text-gray-300" /> };
    }
  };

  const details = getVerdictDetails(verdict);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      <div className={clsx("glass-panel p-6 border-l-4", details.border)}>
        <div className="flex items-center gap-4 mb-4">
          {details.icon}
          <div>
            <h3 className={clsx("text-2xl font-bold uppercase tracking-wider", details.color)}>
              {verdict}
            </h3>
            <p className="text-sm text-white/70">Confidence Score: {(confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-black/20 p-4 rounded-xl border border-white/10">
          <h4 className="font-semibold mb-2 text-white/90">AI Reasoning:</h4>
          <p className="text-white/80 leading-relaxed">{reasoning}</p>
        </div>
      </div>

      {threat_card && (
        <div className="glass-panel p-6 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-3 text-orange-400">
            <ShieldAlert />
            <h4 className="font-bold text-lg">Threat Attribution (DISARM)</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-3 rounded-lg">
              <span className="block text-xs text-white/50 mb-1">Tactic</span>
              <span className="font-semibold">{threat_card.tactic}</span>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <span className="block text-xs text-white/50 mb-1">Technique</span>
              <span className="font-semibold">{threat_card.technique}</span>
            </div>
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="glass-panel p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" /> Evidence Citations
          </h4>
          <ul className="space-y-3">
            {sources.map((source, idx) => (
              <li key={idx}>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-black/20 hover:bg-black/40 border border-white/10 rounded-lg transition-colors group"
                >
                  <span className="text-blue-300 group-hover:text-blue-200 truncate font-medium">
                    {source.title || source.url}
                  </span>
                  <ExternalLink className="w-4 h-4 text-white/40 ml-auto flex-shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
