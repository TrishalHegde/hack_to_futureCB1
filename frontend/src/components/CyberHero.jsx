import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe } from 'lucide-react';

export const CyberHero = () => {
  return (
    <div className="relative pt-20 pb-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
          <Zap className="w-3 h-3" /> System Status: Operational
        </div>
        
        <h1 className="text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
          VAULTX <span className="text-cyan-500 neon-text-cyan">SYSTEMS</span>
        </h1>
        
        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed mb-12">
          Advanced Cyber-Intelligence Probe for verifying viral narratives, 
          synthesized media, and global misinformation risks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
          <StatCard icon={<Shield className="text-cyan-400" />} label="Security Level" value="Level 4" />
          <StatCard icon={<Globe className="text-magenta-400" />} label="Nodes Active" value="1,204" />
          <StatCard icon={<Zap className="text-lime-400" />} label="Analysis Speed" value="< 4s" />
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="cyber-card flex items-center gap-4 py-4">
    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
      {icon}
    </div>
    <div className="text-left">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);
