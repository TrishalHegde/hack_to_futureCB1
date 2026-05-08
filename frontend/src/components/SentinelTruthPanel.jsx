import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FileText, Download, Share2, Code2, Settings, Globe, Zap } from 'lucide-react';

// ─── Reusable Arc Gauge ─────────────────────────────────────────────────────
const ArcGauge = ({ value = 0, size = 200 }) => {
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;
  const toRad = (d) => (d * Math.PI) / 180;
  const startAngle = -215;
  const totalAngle = 250;
  const angle = startAngle + (value / 100) * totalAngle;

  const arc = (start, end, rad) => {
    const s = { x: cx + rad * Math.cos(toRad(start)), y: cy + rad * Math.sin(toRad(start)) };
    const e = { x: cx + rad * Math.cos(toRad(end)),   y: cy + rad * Math.sin(toRad(end)) };
    const large = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rad} ${rad} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const color = value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#22c55e';
  const label = value > 70 ? '🔴 RED: Likely False' : value > 40 ? '🟠 ORANGE: Unverified' : '🟢 GREEN: Credible';
  const labelColor = value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#22c55e';

  const needleX = cx + r * Math.cos(toRad(angle));
  const needleY = cy + r * Math.sin(toRad(angle));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.78}>
        <defs>
          <linearGradient id="gaugeGradSentinel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#22c55e" />
            <stop offset="50%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path d={arc(startAngle, startAngle + totalAngle, r)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.065} strokeLinecap="round" />
        <path d={arc(startAngle, angle, r)} fill="none" stroke="url(#gaugeGradSentinel)" strokeWidth={size * 0.065} strokeLinecap="round" />
        <circle cx={needleX} cy={needleY} r={size * 0.036} fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        <text x={cx} y={cy + 4} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.24} fontWeight="900" fill={color} fontFamily="monospace">{value}</text>
        <text x={cx} y={cy + size * 0.2} textAnchor="middle" fontSize={size * 0.07} fill="#475569" fontFamily="monospace" fontWeight="bold">MISINFORMATION RISK</text>
      </svg>
      <span className="mt-1 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full"
        style={{ background: `${labelColor}18`, color: labelColor, border: `1px solid ${labelColor}40` }}>
        {label}
      </span>
    </div>
  );
};

// ─── Chart data ─────────────────────────────────────────────────────────────
const spreadData = [
  { m: 'Jan', velocity: 120 }, { m: 'Feb', velocity: 340 }, { m: 'Mar', velocity: 780 },
  { m: 'Apr', velocity: 980 }, { m: 'May', velocity: 1380 }, { m: 'Jun', velocity: 1560 },
];
const spikeData = [
  { m: 'Jan', c: 30, o: 90 }, { m: 'Feb', c: 70, o: 80 }, { m: 'Mar', c: 130, o: 60 },
  { m: 'Apr', c: 90, o: 110 }, { m: 'May', c: 160, o: 95 }, { m: 'Jun', c: 100, o: 140 },
];
const langData = [
  { name: 'Hindi',   value: 40, color: '#00f5d4' },
  { name: 'Kannada', value: 25, color: '#a855f7' },
  { name: 'Telugu',  value: 20, color: '#f97316' },
  { name: 'Mixed',   value: 15, color: '#facc15' },
];

const MINI_REPORTS = [
  { title: 'Source Clusters',    icon: '🔵' },
  { title: 'Spread Timeline',    icon: '📈' },
  { title: 'Language Dist.',     icon: '🌐' },
  { title: 'Bot Detection',      icon: '🤖' },
  { title: 'Credibility Score',  icon: '🛡️' },
];

const ChartTooltip = ({ active, payload }) =>
  active && payload?.length ? (
    <div style={{ background: '#0d1526', border: '1px solid rgba(0,245,212,0.2)', borderRadius: 8, padding: '6px 10px', fontSize: 10 }}>
      {payload.map(p => <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</p>)}
    </div>
  ) : null;

// ─── Small Arc Gauge ────────────────────────────────────────────────────────
const SmallGauge = ({ value = 0, size = 130, label = '' }) => {
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2 + size * 0.06;
  const toRad = d => (d * Math.PI) / 180;
  const start = -215;
  const total = 250;
  const angle = start + (value / 100) * total;
  const arc = (s, e, rad) => {
    const p1 = { x: cx + rad * Math.cos(toRad(s)), y: cy + rad * Math.sin(toRad(s)) };
    const p2 = { x: cx + rad * Math.cos(toRad(e)), y: cy + rad * Math.sin(toRad(e)) };
    const large = Math.abs(e - s) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${rad} ${rad} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };
  const color = value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#22c55e';
  const ndX = cx + r * Math.cos(toRad(angle));
  const ndY = cy + r * Math.sin(toRad(angle));
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.78}>
        <defs>
          <linearGradient id="sgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path d={arc(start, start + total, r)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.07} strokeLinecap="round" />
        <path d={arc(start, angle, r)} fill="none" stroke="url(#sgGrad)" strokeWidth={size * 0.07} strokeLinecap="round" />
        <circle cx={ndX} cy={ndY} r={size * 0.04} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
        <text x={cx} y={cy + 4} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.22} fontWeight="900" fill={color} fontFamily="monospace">{value}</text>
      </svg>
      {label && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 -mt-1">{label}</p>}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const SentinelTruthPanel = ({ result }) => {
  if (!result) return null;
  const riskScore = Math.round(
    result.verdict?.includes('FALSE') ? 80 + Math.random() * 15 :
    result.verdict?.includes('MIXED') ? 45 + Math.random() * 20 :
    result.verdict?.includes('TRUE')  ? 15 + Math.random() * 20 : 55
  );
  const botScore = Math.round(riskScore * 0.7 + Math.random() * 15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mt-10 space-y-6"
      style={{ fontFamily: "'Share Tech Mono', 'Courier New', monospace" }}
    >
      {/* Section Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
          style={{ background: 'rgba(0,245,212,0.08)', borderColor: 'rgba(0,245,212,0.2)' }}>
          <Zap className="w-5 h-5" style={{ color: '#00f5d4' }} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">
            Sentinel Truth <span style={{ color: '#00f5d4' }}>AI Analysis</span>
          </h3>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Extended intelligence report</p>
        </div>
      </div>

      {/* A: Risk Gauge */}
      <div className="rounded-2xl border p-8 flex flex-col items-center" style={cardStyle}>
        <ArcGauge value={riskScore} size={220} />
      </div>

      {/* B: Three Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Card 1 — Spread Analysis */}
        <div className="rounded-2xl border p-5 space-y-4" style={cardStyle}>
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: '#00f5d4' }} />
            <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00f5d4' }}>Spread Analysis</h4>
          </div>
          {/* Mini SVG map with dots */}
          <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(0,245,212,0.02)', border: '1px solid rgba(0,245,212,0.07)' }}>
            <svg viewBox="0 0 100 55" className="w-full" height={90}>
              <path d="M5,18 L22,16 L26,24 L22,38 L14,40 L6,34 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.3" />
              <path d="M20,42 L30,40 L33,53 L24,57 L18,52 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.3" />
              <path d="M42,12 L56,11 L57,20 L50,22 L43,20 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.3" />
              <path d="M44,26 L56,24 L59,38 L53,50 L44,51 L39,44 L39,33 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.3" />
              <path d="M57,11 L88,10 L91,22 L87,36 L74,40 L59,35 L56,22 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.3" />
              {[{x:67,y:42},{x:18,y:32},{x:27,y:57},{x:79,y:50}].map((p,i)=>(
                <g key={i}>
                  <circle cx={`${p.x}%`} cy={`${p.y}%`} r="3" fill="#00f5d4" opacity="0.15" />
                  <circle cx={`${p.x}%`} cy={`${p.y}%`} r="1.5" fill="#00f5d4" opacity="0.8" style={{filter:'drop-shadow(0 0 4px #00f5d4)'}} />
                </g>
              ))}
            </svg>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={spreadData}>
              <defs>
                <linearGradient id="velocGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f5d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fill: '#475569', fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="velocity" stroke="#00f5d4" strokeWidth={1.5} fill="url(#velocGrad)" dot={false} name="Repost Velocity" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest text-center">Repost Velocity (Jan–Jun)</p>
        </div>

        {/* Card 2 — Coordination */}
        <div className="rounded-2xl border p-5 space-y-4" style={cardStyle}>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-purple-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400">Coordination Detection</h4>
          </div>
          <div className="flex justify-center">
            <SmallGauge value={botScore} size={130} label="Bot Activity Score" />
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={spikeData} barGap={2}>
              <XAxis dataKey="m" tick={{ fill: '#475569', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="c" fill="#a855f7" radius={[3,3,0,0]} name="Coordinated" />
              <Bar dataKey="o" fill="#00f5d4" radius={[3,3,0,0]} name="Organic" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest text-center">Spike Detection (Jan–Jun)</p>
        </div>

        {/* Card 3 — Language Spread */}
        <div className="rounded-2xl border p-5 space-y-4" style={cardStyle}>
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: '#facc15' }} />
            <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#facc15' }}>Language Spread</h4>
          </div>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={langData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" paddingAngle={3}>
                  {langData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 5px ${entry.color}80)` }} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {langData.map(l => (
                <div key={l.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color, boxShadow: `0 0 5px ${l.color}` }} />
                  <div>
                    <p className="text-slate-300 text-[10px] font-bold">{l.name}</p>
                    <p className="text-[9px] font-black" style={{ color: l.color }}>{l.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* C: AI Explanation Pills */}
      <div className="rounded-2xl border p-5" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: '#00f5d4' }} />
            <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00f5d4' }}>AI Pattern Recognition</h4>
          </div>
          <Settings size={14} className="text-slate-600" />
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            'This message is rapidly spreading in Telegram groups',
            'Detected in 12 channels within 45 minutes',
            'Pattern matches known misinformation campaigns',
          ].map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(0,245,212,0.06)',
                border: '1px solid rgba(0,245,212,0.2)',
                color: '#7dd3fc',
                boxShadow: '0 0 12px rgba(0,245,212,0.06)',
              }}
            >
              <span style={{ color: '#00f5d4', fontSize: 10 }}>●</span> {msg}
            </motion.div>
          ))}
        </div>
      </div>

      {/* D: Intelligence Report Generator */}
      <div className="rounded-2xl border p-6 space-y-5" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black uppercase tracking-tighter text-white">
              Intelligence Report <span style={{ color: '#00f5d4' }}>Generator</span>
            </h4>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">Export full disinformation analysis report</p>
          </div>
          {/* Format toggles */}
          <div className="flex items-center gap-2">
            {[
              { icon: <FileText size={12} />, label: 'PDF', active: true },
              { icon: <Share2 size={12} />, label: 'Share', active: false },
              { icon: <Code2 size={12} />, label: 'JSON', active: false },
            ].map(({ icon, label, active }) => (
              <button key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: active ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(0,245,212,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? '#00f5d4' : '#475569',
                }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,212,0.15), rgba(168,85,247,0.1))',
            border: '1px solid rgba(0,245,212,0.4)',
            color: '#00f5d4',
            boxShadow: '0 0 30px rgba(0,245,212,0.1)',
          }}>
          <Download size={18} /> Generate Intelligence Report (PDF)
        </button>

        {/* Mini Report Preview Strip */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {MINI_REPORTS.map((rpt, i) => (
            <div key={i} className="shrink-0 w-44 rounded-xl border p-3 relative"
              style={{ background: 'rgba(6,12,30,0.8)', borderColor: 'rgba(0,245,212,0.1)', minHeight: 120 }}>
              <span className="absolute top-2 right-2 text-[8px] font-black bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">AI</span>
              <div className="text-2xl mb-2">{rpt.icon}</div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{rpt.title}</p>
              <div className="mt-2 space-y-1">
                {[65, 40, 80].map((w, j) => (
                  <div key={j} className="h-1 rounded-full" style={{ width: `${w}%`, background: ['#00f5d4', '#a855f7', '#facc15'][j], opacity: 0.6 }} />
                ))}
              </div>
              <p className="absolute bottom-2 left-3 text-[7px] text-slate-700 uppercase tracking-widest">VaultX Systems</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const cardStyle = {
  background: 'rgba(13,21,38,0.9)',
  borderColor: 'rgba(0,245,212,0.1)',
  backdropFilter: 'blur(16px)',
};
