import React, { useState } from 'react';
import { Search, Loader2, Cpu, Languages, ChevronDown, ChevronUp } from 'lucide-react';

const SAMPLE_CLAIMS = [
  { lang: '🇬🇧 English', label: 'Misinformation', text: 'Scientists confirm that 5G towers are causing cancer in major cities across the world.' },
  { lang: '🇮🇳 Hindi', label: 'Viral Rumour', text: 'सरकार ने घोषणा की है कि कल से सभी बैंक खाते बंद हो जाएंगे और पैसा जब्त किया जाएगा।' },
  { lang: '🇮🇳 Hinglish', label: 'WhatsApp Forward', text: 'Bhai log urgent! Aaj raat 12 baje se WhatsApp band ho raha hai, abhi apna number save karo.' },
  { lang: '🇧🇩 Bengali', label: 'Health Claim', text: 'গবেষণায় প্রমাণিত হয়েছে যে লেবু পানি পান করলে ক্যান্সার সম্পূর্ণ সেরে যায়।' },
  { lang: '🇪🇸 Spanish', label: 'Political', text: 'El gobierno ha confirmado que introducirá un nuevo impuesto del 50% sobre todos los ahorros bancarios.' },
  { lang: '🇫🇷 French', label: 'Deepfake Alert', text: 'Une vidéo deepfake du président circulant sur les réseaux sociaux déclare une guerre contre la Russie.' },
  { lang: '🇩🇪 German', label: 'Science', text: 'Neue Studie beweist: Impfungen führen direkt zu Autismus bei Kindern unter 5 Jahren.' },
  { lang: '🇸🇦 Arabic', label: 'Viral Claim', text: 'تم تأكيد انتشار فيروس جديد أشد خطورة من كورونا في مدن كبرى حول العالم.' },
];

export const InputSection = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  const handleSampleClick = (sampleText) => {
    setText(sampleText);
    setShowSamples(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="cyber-card p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Neural <span className="text-cyan-500">Input</span></h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Inject claim data for deep analysis — any language</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste suspicious message, tweet, or viral claim in any language — Hindi, English, Arabic, Hinglish, Bengali..."
              className="cyber-input min-h-[160px] w-full text-base leading-relaxed shadow-inner"
              dir="auto"
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
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Linguistic Analysis</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-lime-500" /> Source Matching</span>
            </div>
          </div>
        </form>
      </div>

      {/* Multi-Language Sample Claims Panel */}
      <div className="cyber-card overflow-hidden">
        <button
          onClick={() => setShowSamples(!showSamples)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
              <Languages className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div>
              <span className="text-xs font-black text-white uppercase tracking-widest">Try Multi-Language Samples</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Hindi · English · Arabic · Bengali · Spanish · French · German</p>
            </div>
          </div>
          {showSamples
            ? <ChevronUp className="w-4 h-4 text-slate-500" />
            : <ChevronDown className="w-4 h-4 text-slate-500" />
          }
        </button>

        {showSamples && (
          <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 pt-4">
            {SAMPLE_CLAIMS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(sample.text)}
                className="text-left p-4 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-cyan-500/30 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sample.lang}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 font-bold uppercase">{sample.label}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 group-hover:text-white transition-colors" dir="auto">
                  {sample.text}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
