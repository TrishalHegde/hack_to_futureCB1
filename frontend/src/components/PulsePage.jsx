import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Globe, Radio, RefreshCw, Zap } from 'lucide-react';

// ─── Mock data generators ──────────────────────────────────────────────────
const CATEGORIES = ['Health', 'Politics', 'Finance', 'Technology', 'Religion', 'Military', 'Celebrity'];
const VERDICTS = [
  { label: 'LIKELY FALSE', color: '#ef4444' },
  { label: 'FALSE',        color: '#dc2626' },
  { label: 'MIXED',        color: '#f59e0b' },
  { label: 'UNVERIFIABLE', color: '#6b7280' },
  { label: 'LIKELY TRUE',  color: '#22c55e' },
];
const LANGUAGES = ['Hindi', 'English', 'Kannada', 'Telugu', 'Tamil', 'Marathi', 'Bangla'];
const CLAIMS = [
  'Govt bans WhatsApp from midnight — all data will be deleted',
  'PM declares national emergency due to flood crisis',
  'New vaccine causes permanent memory loss in clinical trial',
  'Stock market crash imminent — sell everything now',
  'Army deployed in 5 major cities amid protest crackdown',
  'Petrol price to rise ₹25 per litre from Monday',
  'RBI to freeze all UPI transactions for 48 hours',
  'Supreme Court orders arrest of opposition leader',
  'NASA confirms asteroid strike in 2027 near India',
  'Aadhaar data of 1.3 billion Indians leaked online',
  'Free electricity scheme for BPL families from next month',
  'Celebrity death hoax spreads across social media',
];

const generateRow = (id) => {
  const v = VERDICTS[Math.floor(Math.random() * VERDICTS.length)];
  const now = new Date();
  now.setMinutes(now.getMinutes() - Math.floor(Math.random() * 59));
  return {
    id,
    claim: CLAIMS[id % CLAIMS.length],
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    verdict: v.label,
    verdictColor: v.color,
    risk: Math.floor(Math.random() * 100),
    language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
    ts: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
};

const generateSparkData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    claims: Math.floor(20 + Math.random() * 180),
  }));

const LANG_COUNTS = [
  { lang: 'Hindi',   count: 342, color: '#00f5d4' },
  { lang: 'English', count: 289, color: '#a855f7' },
  { lang: 'Kannada', count: 187, color: '#facc15' },
  { lang: 'Telugu',  count: 154, color: '#f97316' },
  { lang: 'Tamil',   count: 132, color: '#06b6d4' },
  { lang: 'Marathi', count: 98,  color: '#ec4899' },
];

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const SparkTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-teal-500/30 rounded-lg px-3 py-2 text-xs">
      <p className="text-teal-400 font-bold">{payload[0].value} claims</p>
      <p className="text-slate-500">{payload[0].payload.hour}</p>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const PulsePage = () => {
  const [rows, setRows] = useState(() => Array.from({ length: 12 }, (_, i) => generateRow(i)));
  const [sparkData, setSparkData] = useState(generateSparkData);
  const [pulsing, setPulsing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const counterRef = useRef(12);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
      const newRow = generateRow(counterRef.current++);
      setRows(prev => [newRow, ...prev.slice(0, 14)]);
      setSparkData(generateSparkData());
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const manualRefresh = () => {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 600);
    const newRow = generateRow(counterRef.current++);
    setRows(prev => [newRow, ...prev.slice(0, 14)]);
    setSparkData(generateSparkData());
    setLastRefresh(new Date());
  };

  return (
    <div
      className="min-h-screen p-8 space-y-8"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060b18 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border"
            style={{ background: 'rgba(0,245,212,0.08)', borderColor: 'rgba(0,245,212,0.2)' }}>
            <Radio className="w-7 h-7" style={{ color: '#00f5d4' }} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
              PULSE <span className="italic" style={{ color: '#00f5d4' }}>LIVE THREAT FEED</span>
            </h1>
            <p className="text-slate-500 text-xs uppercase tracking-[0.3em] mt-1">
              Real-time misinformation detection · Auto-refreshes every 30s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${pulsing ? 'scale-150' : ''} transition-transform duration-300`}
              style={{ background: '#00f5d4', boxShadow: '0 0 8px #00f5d4' }}
            />
            LIVE · {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <button
            onClick={manualRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              background: 'rgba(0,245,212,0.08)',
              border: '1px solid rgba(0,245,212,0.25)',
              color: '#00f5d4',
            }}
          >
            <RefreshCw size={14} className={pulsing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Sparkline + Language Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Volume Chart */}
        <div className="lg:col-span-2 rounded-2xl p-5 border" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: '#00f5d4' }} />
              <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#00f5d4' }}>
                Claim Volume · Last 24 Hours
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Updated live</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00f5d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00f5d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<SparkTooltip />} />
              <Area type="monotone" dataKey="claims" stroke="#00f5d4" strokeWidth={2} fill="url(#tealGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Language Pills */}
        <div className="rounded-2xl p-5 border" style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} style={{ color: '#00f5d4' }} />
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#00f5d4' }}>
              Top Languages
            </h3>
          </div>
          <div className="space-y-3">
            {LANG_COUNTS.map(({ lang, count, color }) => (
              <div key={lang} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className="text-slate-300 text-sm font-semibold">{lang}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / 342) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono" style={{ color }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Feed Table */}
      <div className="rounded-2xl border overflow-hidden" style={cardStyle}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(0,245,212,0.1)' }}>
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: '#facc15' }} />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Live Misinformation Feed</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{rows.length} claims tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['Claim Preview', 'Category', 'Verdict', 'Risk', 'Language', 'Time'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={i === 0 ? { opacity: 0, y: -10, backgroundColor: 'rgba(0,245,212,0.08)' } : {}}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                  transition={{ duration: 0.5 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="text-slate-300 text-xs font-mono truncate block max-w-[280px]">{row.claim}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
                      {row.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: row.verdictColor }}>
                      {row.verdict}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${row.risk}%`,
                            background: row.risk > 70 ? '#ef4444' : row.risk > 40 ? '#f59e0b' : '#22c55e',
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-400">{row.risk}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-400 font-medium">{row.language}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-mono text-slate-600">{row.ts}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
