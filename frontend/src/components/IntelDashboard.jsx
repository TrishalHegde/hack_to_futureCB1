import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, Fingerprint, Database, Network } from 'lucide-react';

export const IntelDashboard = ({ result, isLoading }) => {
  if (isLoading) return <LoadingScanner />;
  if (!result) return null;

  const { verdict, confidence, reasoning, risk_metrics, category, sources, threat_card } = result;

  const chartData = [
    { name: 'Fear', value: risk_metrics?.fear_level || 0, color: '#f87171' },
    { name: 'Urgency', value: risk_metrics?.urgency_level || 0, color: '#fbbf24' },
    { name: 'Conspiracy', value: risk_metrics?.conspiracy_level || 0, color: '#c084fc' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Verdict & Metrics */}
        <div className="lg:col-span-8 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-48 h-48" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-white/5">
              <div className="flex flex-col items-center justify-center p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 w-full md:w-auto min-w-[200px]">
                <span className="text-[60px] font-black leading-none tracking-tighter text-cyan-400 neon-text-cyan">
                  {Math.round(confidence * 100)}%
                </span>
                <span className="text-[10px] font-bold text-cyan-500/50 uppercase tracking-[0.3em] mt-2">Trust Rating</span>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mb-2 block">Intelligence Verdict</span>
                <h3 className={`text-6xl font-black uppercase tracking-tighter ${getVerdictColor(verdict)}`}>
                  {verdict}
                </h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded bg-slate-800 text-[10px] font-bold uppercase text-slate-400">Category: {category}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Database className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Synthetic Reasoning</span>
              </div>
              <p className="text-xl text-slate-300 font-light italic leading-relaxed">
                "{reasoning}"
              </p>
            </div>
          </motion.div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sources.map((source, idx) => (
              <a key={idx} href={source.url} target="_blank" rel="noreferrer" className="cyber-card p-4 hover:border-cyan-500/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-500 font-bold border border-white/5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className="font-bold text-slate-200 line-clamp-1 mb-1">{source.title}</h5>
                    <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-mono">{source.url}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Risk Analysis */}
        <div className="lg:col-span-4 space-y-8">
          <div className="cyber-card">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-magenta-500" /> Linguistic Risk Profile
            </h4>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 mt-4">
              {chartData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 uppercase font-bold tracking-widest">{item.name}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Card */}
          {threat_card && (
            <div className="cyber-card border-magenta-500/20">
              <div className="flex items-center gap-2 text-magenta-400 mb-6">
                <Fingerprint className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-widest text-sm">Threat Attribution</h4>
              </div>
              <div className="space-y-3">
                <DetailRow label="Tactic" value={threat_card.tactic} />
                <DetailRow label="Technique" value={threat_card.technique} />
                <DetailRow label="Framework" value="DISARM" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingScanner = () => (
  <div className="w-full max-w-4xl mx-auto my-20">
    <div className="cyber-card relative py-20 text-center overflow-hidden">
      <div className="scanner-line" />
      <Network className="w-16 h-16 text-cyan-500 mx-auto mb-8 animate-pulse" />
      <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-[0.4em] mb-4">Neural Scanning Active</h3>
      <div className="flex flex-col gap-2 max-w-xs mx-auto text-xs font-bold text-slate-500 uppercase tracking-widest">
        <p className="animate-pulse">Matching news repositories...</p>
        <p className="animate-pulse delay-75">Analyzing linguistic volatility...</p>
        <p className="animate-pulse delay-150">Synthesizing semantic verdict...</p>
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</span>
    <span className="text-xs text-white font-medium">{value}</span>
  </div>
);

const getVerdictColor = (v) => {
  if (v.includes('TRUE')) return 'text-lime-400 neon-text-cyan';
  if (v.includes('FALSE')) return 'text-red-400 neon-text-magenta';
  if (v.includes('MIXED')) return 'text-amber-400';
  return 'text-slate-400';
};
