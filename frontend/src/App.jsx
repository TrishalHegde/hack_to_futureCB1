import React, { useState } from 'react';
import { Home, LayoutDashboard, Settings, Activity, ShieldAlert, Zap, Fingerprint, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberHero } from './components/CyberHero';
import { InputSection } from './components/InputSection';
import { IntelDashboard } from './components/IntelDashboard';
import { AdminCenter } from './components/AdminCenter';
import { MediaForensicScanner } from './components/MediaForensicScanner';
import { PulsePage } from './components/PulsePage';
import { ThreatsPage } from './components/ThreatsPage';
import { SentinelTruthPanel } from './components/SentinelTruthPanel';
import { verifyClaim } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (text) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await verifyClaim(text);
      setResult(data);
    } catch {
      setError('Vault Connection Failed. AI Engine Offline.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">

      {/* ── Sidebar ── */}
      <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col items-center lg:items-start p-6 bg-slate-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)]">
            <Zap className="text-black w-6 h-6" />
          </div>
          <h1 className="hidden lg:block text-xl font-black uppercase tracking-tighter italic">
            VAULT<span className="text-cyan-500">X</span>
          </h1>
        </div>

        <nav className="flex-1 w-full space-y-2">
          <NavButton active={activeTab === 'home'}      icon={<Home size={20} />}         label="Home"      onClick={() => setActiveTab('home')} />
          <NavButton active={activeTab === 'forensics'} icon={<Fingerprint size={20} />}  label="Forensics" onClick={() => setActiveTab('forensics')} />
          <NavButton active={activeTab === 'admin'}     icon={<LayoutDashboard size={20}/>} label="Admin"   onClick={() => setActiveTab('admin')} />
          <NavButton active={activeTab === 'pulse'}     icon={<Radio size={20} />}         label="Pulse"     onClick={() => setActiveTab('pulse')} />
          <NavButton active={activeTab === 'threats'}   icon={<ShieldAlert size={20} />}   label="Threats"   onClick={() => setActiveTab('threats')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 w-full">
          <NavButton icon={<Settings size={20} />} label="Config" />
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <AnimatePresence mode="wait">

          {/* HOME */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
              <CyberHero />
              <div className="max-w-7xl mx-auto px-4 -mt-8 mb-20 relative z-10">
                {!result && !isLoading ? (
                  <div className="animate-in slide-in-from-bottom-10 duration-700">
                    <InputSection onSubmit={handleVerify} isLoading={isLoading} />
                  </div>
                ) : (
                  <IntelDashboard result={result} isLoading={isLoading} />
                )}

                {error && (
                  <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center font-bold tracking-widest uppercase text-xs animate-pulse">
                    {error}
                  </div>
                )}

                {/* Sentinel Truth AI Panel — shown after result */}
                {result && !isLoading && (
                  <>
                    <SentinelTruthPanel result={result} />
                    <div className="mt-12 flex justify-center">
                      <button onClick={() => setResult(null)} className="cyber-button">
                        Initiate New Scan
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* FORENSICS */}
          {activeTab === 'forensics' && (
            <motion.div key="forensics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MediaForensicScanner />
            </motion.div>
          )}

          {/* ADMIN */}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminCenter />
            </motion.div>
          )}

          {/* PULSE */}
          {activeTab === 'pulse' && (
            <motion.div key="pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PulsePage />
            </motion.div>
          )}

          {/* THREATS */}
          {activeTab === 'threats' && (
            <motion.div key="threats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ThreatsPage />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

const NavButton = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
      active
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,242,255,0.1)]'
        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
