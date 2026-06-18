import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Radio, Play, Square, AlertTriangle } from 'lucide-react';
import { NarrativeTimeline, PlatformMonitorPanel, CoordinationNetworkGraph } from './PulseExtensions';

const LANGUAGES = ['Hindi', 'Kannada', 'Telugu', 'English', 'Tamil', 'Marathi'];

const generateTrendData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    claims: Math.floor(10 + Math.random() * 90)
  }));
};

export const PulsePage = () => {
  const [feed, setFeed] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef(null);

  // Stats
  const trendData = useRef(generateTrendData()).current;
  const langStats = useRef(LANGUAGES.map(lang => ({
    lang,
    count: Math.floor(50 + Math.random() * 200)
  }))).current;

  const fetchRumors = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/web_rumors');
      const data = await response.json();
      if (data && data.length > 0) {
        const mappedFeed = data.map(claim => ({
          id: claim.id + '-' + Math.random().toString(36).substr(2, 5),
          preview: claim.text || 'Unknown Claim',
          category: claim.category || 'General',
          verdict: claim.verdict || 'UNVERIFIABLE',
          riskScore: claim.risk_score || 0,
          language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
          timestamp: new Date(claim.timestamp).toLocaleTimeString(),
        }));
        setFeed(prev => {
          const newFeed = [...mappedFeed, ...prev];
          return newFeed.slice(0, 50);
        });
      }
    } catch (err) {
      console.error('Failed to fetch rumors:', err);
    }
  };

  const handleStart = () => {
    if (isStreaming) return;
    setIsStreaming(true);
    fetchRumors();
    intervalRef.current = setInterval(() => {
      fetchRumors();
    }, 30000);
  };

  const handleStop = () => {
    if (!isStreaming) return;
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0a0f1e' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Radio size={32} style={{ color: '#00f5d4' }} />
          <div>
            <h1 className="text-4xl uppercase">
              <span className="text-white font-bold tracking-tight">PULSE</span>{' '}
              <span className="italic" style={{ color: '#00f5d4' }}>LIVE THREAT FEED</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleStart} 
            disabled={isStreaming}
            className={`flex items-center gap-2 px-6 py-2 rounded font-bold uppercase transition-opacity ${isStreaming ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            style={{ backgroundColor: '#00f5d4', color: '#0a0f1e' }}
          >
            <Play size={16} /> Recent Rumors
          </button>
          <button 
            onClick={handleStop} 
            disabled={!isStreaming}
            className={`flex items-center gap-2 px-6 py-2 rounded font-bold uppercase transition-opacity ${!isStreaming ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            style={{ backgroundColor: '#facc15', color: '#0a0f1e' }}
          >
            <Square size={16} /> Stop
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend AreaChart */}
        <div className="lg:col-span-2 p-6 rounded-xl border" style={{ backgroundColor: 'rgba(10,15,30,0.8)', borderColor: 'rgba(0,245,212,0.2)' }}>
          <h2 className="text-sm font-bold uppercase mb-4" style={{ color: '#00f5d4' }}>Claim Volume (Last 24hrs)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', borderColor: '#00f5d4', color: '#fff' }} itemStyle={{ color: '#00f5d4' }} />
              <Area type="monotone" dataKey="claims" stroke="#00f5d4" strokeWidth={2} fill="#00f5d4" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Language Pills */}
        <div className="p-6 rounded-xl border flex flex-col justify-center" style={{ backgroundColor: 'rgba(10,15,30,0.8)', borderColor: 'rgba(0,245,212,0.2)' }}>
          <h2 className="text-sm font-bold uppercase mb-4" style={{ color: '#00f5d4' }}>Language Activity</h2>
          <div className="flex flex-wrap gap-3">
            {langStats.map(stat => (
              <div key={stat.lang} className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm" style={{ borderColor: 'rgba(0,245,212,0.3)', backgroundColor: 'rgba(0,245,212,0.05)' }}>
                <span className="text-white text-sm font-medium">{stat.lang}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#00f5d4', color: '#0a0f1e' }}>{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Feed Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'rgba(10,15,30,0.8)', borderColor: 'rgba(0,245,212,0.2)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,245,212,0.2)' }}>
          <h2 className="text-sm font-bold uppercase text-white flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: '#facc15' }} /> Incoming Intelligence
          </h2>
          {isStreaming && (
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(0,245,212,0.1)', color: '#00f5d4' }}>
              • Live
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ backgroundColor: 'rgba(0,245,212,0.05)' }}>
              <tr>
                {['Claim Preview', 'Category', 'Verdict', 'Risk Score', 'Language', 'Timestamp'].map(h => (
                  <th key={h} className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]" style={{ color: '#00f5d4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No incoming claims. Click "Recent Rumors" to stream.</td>
                </tr>
              ) : (
                feed.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="px-6 py-4 text-slate-200 max-w-[300px] truncate" title={row.preview}>{row.preview}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.2)' }}>
                        {row.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-black tracking-wide uppercase" style={{ color: row.verdict.includes('TRUE') ? '#22c55e' : row.verdict.includes('FALSE') ? '#ef4444' : '#facc15' }}>
                      {row.verdict}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${row.riskScore}%`, backgroundColor: row.riskScore > 70 ? '#ef4444' : row.riskScore > 40 ? '#facc15' : '#00f5d4' }} />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">{row.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-medium">{row.language}</td>
                    <td className="px-6 py-4 text-slate-500 text-[10px] font-mono">{row.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── NEW SECTIONS ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <NarrativeTimeline />
        <PlatformMonitorPanel isStreaming={isStreaming} />
        <CoordinationNetworkGraph />
      </div>
    </div>
  );
};
