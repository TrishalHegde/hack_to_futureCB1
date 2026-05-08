import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ShieldAlert, Globe, Zap, TrendingUp } from 'lucide-react';

// ─── SVG Arc Gauge ─────────────────────────────────────────────────────────
const ArcGauge = ({ value = 0, size = 180, label = '', sublabel = '' }) => {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2 + size * 0.05;
  const startAngle = -210;
  const totalAngle = 240;
  const angle = startAngle + (value / 100) * totalAngle;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (start, end, radius) => {
    const s = { x: cx + radius * Math.cos(toRad(start)), y: cy + radius * Math.sin(toRad(start)) };
    const e = { x: cx + radius * Math.cos(toRad(end)),   y: cy + radius * Math.sin(toRad(end)) };
    const large = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needleX = cx + r * Math.cos(toRad(angle));
  const needleY = cy + r * Math.sin(toRad(angle));
  const color = value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#22c55e';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`gaugeGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#22c55e" />
            <stop offset="50%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path d={arcPath(startAngle, startAngle + totalAngle, r)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.07} strokeLinecap="round" />
        {/* Fill */}
        <path d={arcPath(startAngle, angle, r)} fill="none" stroke={`url(#gaugeGrad-${label})`} strokeWidth={size * 0.07} strokeLinecap="round" />
        {/* Needle dot */}
        <circle cx={needleX} cy={needleY} r={size * 0.04} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        {/* Center value */}
        <text x={cx} y={cy + 6} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.2} fontWeight="900" fill={color} fontFamily="monospace">{value}</text>
      </svg>
      {label && <p className="text-xs font-black uppercase tracking-widest text-slate-400 -mt-2">{label}</p>}
      {sublabel && <p className="text-[10px] text-slate-600 mt-1">{sublabel}</p>}
    </div>
  );
};

// ─── World Map with dots ────────────────────────────────────────────────────
const HOTSPOTS = [
  { name: 'India',       cx: 67, cy: 48, claims: 1204, lang: 'Hindi',   risk: 'HIGH' },
  { name: 'USA',         cx: 18, cy: 38, claims: 876,  lang: 'English', risk: 'MEDIUM' },
  { name: 'Brazil',      cx: 28, cy: 62, claims: 643,  lang: 'Portuguese', risk: 'MEDIUM' },
  { name: 'Pakistan',    cx: 63, cy: 43, claims: 512,  lang: 'Urdu',    risk: 'HIGH' },
  { name: 'Nigeria',     cx: 50, cy: 52, claims: 401,  lang: 'English', risk: 'HIGH' },
  { name: 'Indonesia',   cx: 78, cy: 56, claims: 338,  lang: 'Bahasa',  risk: 'MEDIUM' },
  { name: 'Russia',      cx: 68, cy: 28, claims: 289,  lang: 'Russian', risk: 'LOW' },
  { name: 'Bangladesh',  cx: 69, cy: 47, claims: 221,  lang: 'Bangla',  risk: 'HIGH' },
];

const ThreatDot = ({ cx, cy, claims, name, lang, risk, size }) => {
  const [hovered, setHovered] = useState(false);
  const r = size > 100 ? 4 + (claims / 300) : 3 + (claims / 400);
  const color = risk === 'HIGH' ? '#ef4444' : risk === 'MEDIUM' ? '#f59e0b' : '#22c55e';

  return (
    <g>
      <circle cx={`${cx}%`} cy={`${cy}%`} r={r * 2} fill={color} opacity={0.08} />
      <circle
        cx={`${cx}%`} cy={`${cy}%`} r={r}
        fill={color} opacity={0.9}
        style={{ cursor: 'pointer', filter: `drop-shadow(0 0 6px ${color})` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {hovered && (
        <foreignObject x={`${cx}%`} y={`${cy}%`} width="160" height="80" style={{ overflow: 'visible' }}>
          <div style={{
            background: '#0d1526', border: '1px solid rgba(0,245,212,0.3)',
            borderRadius: '8px', padding: '8px 10px', fontSize: '10px',
            color: '#e2e8f0', whiteSpace: 'nowrap', transform: 'translate(-50%, -120%)',
          }}>
            <div style={{ color: '#00f5d4', fontWeight: 900, marginBottom: 2 }}>{name}</div>
            <div>{claims} active claims</div>
            <div>Top: {lang} · Risk: <span style={{ color }}>{risk}</span></div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

// ─── Spike Chart data ───────────────────────────────────────────────────────
const spikeData = [
  { month: 'Jan', coordinated: 40, organic: 80 },
  { month: 'Feb', coordinated: 65, organic: 95 },
  { month: 'Mar', coordinated: 120, organic: 60 },
  { month: 'Apr', coordinated: 85, organic: 110 },
  { month: 'May', coordinated: 150, organic: 90 },
  { month: 'Jun', coordinated: 95, organic: 140 },
];

const TOP_THREATS = [
  { title: 'Mass vaccine death cover-up claim',      cat: 'Health',    risk: 91, lang: 'Hindi'   },
  { title: 'Emergency election fraud narrative',     cat: 'Politics',  risk: 84, lang: 'English' },
  { title: 'Central bank collapse rumour',           cat: 'Finance',   risk: 77, lang: 'Kannada' },
  { title: 'Terrorist sleeper cell activation hoax', cat: 'Military',  risk: 69, lang: 'Urdu'    },
  { title: 'AI robot uprising disinformation wave',  cat: 'Tech',      risk: 58, lang: 'Telugu'  },
];

const SpikeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1526', border: '1px solid rgba(0,245,212,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
      <p style={{ color: '#a855f7', fontWeight: 700 }}>Coordinated: {payload[0]?.value}</p>
      <p style={{ color: '#00f5d4', fontWeight: 700 }}>Organic: {payload[1]?.value}</p>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const ThreatsPage = () => {
  const globalThreat = 72;
  const botScore = 58;

  return (
    <div className="min-h-screen p-8 space-y-8"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060b18 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <ShieldAlert className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            THREAT <span className="italic" style={{ color: '#00f5d4' }}>INTELLIGENCE MAP</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-[0.3em] mt-1">
            Global misinformation hotspots · Coordinated threat detection
          </p>
        </div>
      </div>

      {/* Map + Gauges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* World Map */}
        <div className="lg:col-span-8 rounded-2xl border p-5" style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={15} style={{ color: '#00f5d4' }} />
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#00f5d4' }}>
              Global Hotspot Map
            </h3>
          </div>
          {/* SVG world map background + dots */}
          <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.07)' }}>
            <svg viewBox="0 0 100 60" className="w-full" style={{ minHeight: 260 }}>
              {/* Simplified continents as path shapes */}
              {/* North America */}
              <path d="M5,20 L22,18 L28,25 L25,40 L18,45 L8,38 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.3" />
              {/* South America */}
              <path d="M20,45 L30,43 L34,55 L28,68 L20,65 L16,55 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.3" />
              {/* Europe */}
              <path d="M42,15 L56,13 L58,22 L52,25 L44,23 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.3" />
              {/* Africa */}
              <path d="M44,28 L56,26 L60,40 L56,55 L46,56 L40,46 L40,35 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.3" />
              {/* Asia */}
              <path d="M57,13 L88,12 L92,25 L88,38 L75,42 L60,38 L57,28 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.3" />
              {/* Australia */}
              <path d="M76,52 L88,50 L90,62 L80,65 L74,60 Z" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.3" />
              {/* Grid lines */}
              {[20,40,60,80].map(x => <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />)}
              {[20,40,60].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />)}
              {/* Hotspot dots */}
              {HOTSPOTS.map(h => <ThreatDot key={h.name} {...h} />)}
            </svg>
            {/* Legend */}
            <div className="absolute bottom-3 right-3 flex items-center gap-4 text-[9px] font-bold uppercase">
              {[['HIGH', '#ef4444'], ['MEDIUM', '#f59e0b'], ['LOW', '#22c55e']].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span style={{ color }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border p-5 flex flex-col items-center" style={cardStyle}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Global Threat Index</p>
            <ArcGauge value={globalThreat} size={160} label="Threat Level" />
            <span className="mt-3 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              🔴 HIGH ALERT
            </span>
          </div>
          <div className="rounded-2xl border p-5 flex flex-col items-center" style={cardStyle}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Bot Activity Score</p>
            <ArcGauge value={botScore} size={140} label="Bot Activity" />
          </div>
        </div>
      </div>

      {/* Top Threats + Spike Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Threats */}
        <div className="rounded-2xl border p-5" style={cardStyle}>
          <div className="flex items-center gap-2 mb-5">
            <Zap size={15} style={{ color: '#facc15' }} />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Top 5 Active Threats</h3>
          </div>
          <div className="space-y-4">
            {TOP_THREATS.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl font-black font-mono mt-1"
                  style={{ color: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#475569', lineHeight: 1 }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-semibold truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}>
                      {t.cat}
                    </span>
                    <span className="text-[9px] text-slate-500">{t.lang}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${t.risk}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: t.risk > 75 ? '#ef4444' : t.risk > 50 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                    <span className="text-[9px] font-bold font-mono text-slate-400">{t.risk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spike Chart */}
        <div className="rounded-2xl border p-5" style={cardStyle}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} style={{ color: '#a855f7' }} />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Coordination Spike Detection</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={spikeData} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<SpikeTooltip />} />
              <Bar dataKey="coordinated" fill="#a855f7" radius={[4,4,0,0]}
                style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.5))' }} />
              <Bar dataKey="organic" fill="#00f5d4" radius={[4,4,0,0]}
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,245,212,0.4))' }} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <span className="w-2 h-2 rounded" style={{ background: '#a855f7' }} /> Coordinated
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <span className="w-2 h-2 rounded" style={{ background: '#00f5d4' }} /> Organic
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: 'rgba(13,21,38,0.9)',
  borderColor: 'rgba(0,245,212,0.1)',
  backdropFilter: 'blur(16px)',
};
