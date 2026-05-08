import React, { useState } from 'react';
import { Search, Loader2, Cpu } from 'lucide-react';

export const InputSection = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div className="cyber-card p-8 md:p-10 w-full max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
          <Cpu className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Neural <span className="text-cyan-500">Input</span></h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Inject claim data for deep analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious message, tweet, or viral claim..."
            className="cyber-input min-h-[200px] w-full text-lg leading-relaxed shadow-inner font-mono"
          />
          <div className="absolute top-4 right-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
            <Search className="w-8 h-8" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="cyber-button w-full md:w-auto min-w-[300px] py-4 group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> 
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                  <span>Initiate Verification</span>
                </>
              )}
            </span>
          </button>
          
          <div className="flex items-center gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Multilingual</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-magenta-500" /> Linguistic Analysis</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-lime-500" /> Source Matching</span>
          </div>
        </div>
      </form>
    </div>
  );
};
