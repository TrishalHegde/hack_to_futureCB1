import React, { useRef, useEffect, useState } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Maximize2, LayoutGrid, MoreHorizontal } from 'lucide-react';

/* ─── shared card style ─────────────────────────────────────────────────── */
const card = {
  backgroundColor: '#0d1526',
  border: '1px solid rgba(0,245,212,0.15)',
  borderRadius: 12,
  padding: 24,
};

/* ══════════════════════════════════════════════════════════════════════════
   SECTION 1 — NARRATIVE TIMELINE
══════════════════════════════════════════════════════════════════════════ */
const timelineData = [
  { time: '2:00 PM', posts: 40 },
  { time: '2:03 PM', posts: 500 },
  { time: '2:06 PM', posts: 320 },
  { time: '2:10 PM', posts: 680 },
  { time: '2:13 PM', posts: 450 },
  { time: '2:15 PM', posts: 910 },
  { time: '2:18 PM', posts: 600 },
  { time: '2:20 PM', posts: 750 },
];

const spikes = [
  { time: '2:03 PM', label: '500 posts surge', color: '#00f5d4' },
  { time: '2:10 PM', label: 'YouTube videos appear', color: '#a855f7' },
  { time: '2:15 PM', label: 'RSS news pickup', color: '#f97316' },
];

const CustomTimelineDot = (props) => {
  const { cx, cy, payload } = props;
  const spike = spikes.find(s => s.time === payload.time);
  if (!spike) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={spike.color} opacity={0.3} />
      <circle cx={cx} cy={cy} r={4} fill={spike.color}
        style={{ filter: `drop-shadow(0 0 6px ${spike.color})` }} />
    </g>
  );
};

const SpikeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const spike = spikes.find(s => s.time === label);
  return (
    <div style={{ background: '#0d1526', border: '1px solid rgba(0,245,212,0.3)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: '#00f5d4', fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#e2e8f0', fontSize: 11 }}>Posts: <strong>{payload[0]?.value}</strong></p>
      {spike && <p style={{ color: spike.color, fontSize: 10, marginTop: 4, fontWeight: 700 }}>⚡ {spike.label}</p>}
    </div>
  );
};

export const NarrativeTimeline = () => (
  <div style={card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div>
        <h2 style={{ color: '#00f5d4', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Narrative Timeline
        </h2>
        <p style={{ color: '#475569', fontSize: 11 }}>Interactive spike — sudden narrative spikes</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[Maximize2, LayoutGrid, MoreHorizontal].map((Icon, i) => (
          <button key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#475569' }}>
            <Icon size={14} />
          </button>
        ))}
      </div>
    </div>

    {/* Spike legend */}
    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
      {spikes.map(s => (
        <div key={s.time} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }} />
          <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600 }}>{s.time} — {s.label}</span>
        </div>
      ))}
    </div>

    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={timelineData}>
        <defs>
          <linearGradient id="nlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.35} />
            <stop offset="60%" stopColor="#f97316" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#0d1526" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip content={<SpikeTooltip />} />
        {spikes.map(s => (
          <ReferenceLine key={s.time} x={s.time} stroke={s.color} strokeDasharray="4 3" strokeOpacity={0.6} />
        ))}
        <Area type="monotone" dataKey="posts" stroke="#00f5d4" strokeWidth={2.5}
          fill="url(#nlGrad)" dot={<CustomTimelineDot />} activeDot={{ r: 6, fill: '#00f5d4' }} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   SECTION 2 — PLATFORM MONITOR PANEL
══════════════════════════════════════════════════════════════════════════ */
const makePlatformStats = () => ({
  telegram:   { views: Math.floor(12000 + Math.random() * 5000), forwards: Math.floor(800 + Math.random() * 400) },
  sharechat:  { shares: Math.floor(3000 + Math.random() * 2000) },
  rss:        { sites: Math.floor(8 + Math.random() * 6) },
  youtube:    { views: Math.floor(45000 + Math.random() * 20000), related: Math.floor(12 + Math.random() * 8) },
});

const PLATFORMS = [
  {
    key: 'telegram', label: 'Telegram', emoji: '🔵', accentColor: '#229ED9',
    render: (s) => [
      { label: 'Views', value: s.views?.toLocaleString() },
      { label: 'Forwards', value: s.forwards?.toLocaleString() },
    ],
  },
  {
    key: 'sharechat', label: 'ShareChat', emoji: '🟡', accentColor: '#facc15',
    render: (s) => [
      { label: 'Shares', value: s.shares?.toLocaleString() },
      { label: 'Spread', value: 'Kannada + Hindi' },
    ],
  },
  {
    key: 'rss', label: 'RSS Feeds', emoji: '🟠', accentColor: '#f97316',
    render: (s) => [
      { label: 'Regional Sites', value: s.sites },
      { label: 'Status', value: 'Discussing narrative' },
    ],
  },
  {
    key: 'youtube', label: 'YouTube', emoji: '🔴', accentColor: '#ef4444',
    render: (s) => [
      { label: 'Video Views', value: s.views?.toLocaleString() },
      { label: 'Related Videos', value: s.related },
    ],
  },
];

export const PlatformMonitorPanel = ({ isStreaming }) => {
  const [stats, setStats] = useState(makePlatformStats());

  useEffect(() => {
    if (!isStreaming) return;
    const t = setInterval(() => setStats(makePlatformStats()), 30000);
    return () => clearInterval(t);
  }, [isStreaming]);

  return (
    <div style={card}>
      <h2 style={{ color: '#00f5d4', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
        Platform Monitor Panel
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {PLATFORMS.map(p => {
          const rows = p.render(stats[p.key]);
          return (
            <div key={p.key} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${p.accentColor}30`,
              borderRadius: 10, padding: 16,
              boxShadow: `0 0 20px ${p.accentColor}10`,
              transition: 'border-color 0.3s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{p.emoji}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13 }}>{p.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'pulse 2s infinite' }} />
                  <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Live</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rows.map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</span>
                    <span style={{ color: p.accentColor, fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   SECTION 3 — COORDINATION NETWORK GRAPH (Canvas + D3 force simulation)
══════════════════════════════════════════════════════════════════════════ */
const GRAPH_NODES = [
  { id: 'ch1',   label: '@truth_channel_xyz', type: 'channel',  x: 400, y: 220, posts: 4201, score: 97 },
  { id: 'ba',    label: 'Bot cluster A',       type: 'botcluster', x: 190, y: 120, posts: 892, score: 88 },
  { id: 'bb',    label: 'Bot cluster B',       type: 'botcluster', x: 600, y: 130, posts: 741, score: 85 },
  { id: 'b1',    label: 'Bot @n1',             type: 'bot',     x: 120, y: 70,  posts: 312, score: 91 },
  { id: 'b2',    label: 'Bot @n2',             type: 'bot',     x: 230, y: 55,  posts: 280, score: 89 },
  { id: 'b3',    label: 'Bot @n3',             type: 'bot',     x: 650, y: 75,  posts: 195, score: 86 },
  { id: 'b4',    label: 'Bot @n4',             type: 'bot',     x: 570, y: 60,  posts: 210, score: 83 },
  { id: 'sa1',   label: 'Shared accounts',     type: 'shared',  x: 280, y: 320, posts: 560, score: 72 },
  { id: 'sh1',   label: 'Shared hashtags',     type: 'shared',  x: 520, y: 330, posts: 420, score: 68 },
  { id: 'b5',    label: 'Bots',                type: 'bot',     x: 160, y: 370, posts: 180, score: 90 },
  { id: 'b6',    label: 'Bots',                type: 'bot',     x: 650, y: 360, posts: 165, score: 87 },
];

const GRAPH_EDGES = [
  ['ch1','ba'],['ch1','bb'],['ch1','sa1'],['ch1','sh1'],
  ['ba','b1'],['ba','b2'],['ba','sa1'],
  ['bb','b3'],['bb','b4'],['bb','sh1'],
  ['sa1','b5'],['sh1','b6'],['b1','b2'],['b3','b4'],
];

const NODE_COLORS = {
  channel: { fill: '#3b82f6', glow: '#3b82f6', radius: 22 },
  botcluster: { fill: '#f97316', glow: '#f97316', radius: 16 },
  bot: { fill: '#ef4444', glow: '#ef4444', radius: 10 },
  shared: { fill: '#64748b', glow: '#94a3b8', radius: 13 },
};

export const CoordinationNetworkGraph = () => {
  const canvasRef = useRef(null);
  const nodesRef = useRef(GRAPH_NODES.map(n => ({ ...n })));
  const velRef   = useRef(GRAPH_NODES.map(() => ({ vx: 0, vy: 0 })));
  const hovRef   = useRef(null);
  const pulseRef = useRef(0);
  const rafRef   = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const getEdgePairs = () => GRAPH_EDGES.map(([a, b]) => ({
      a: nodesRef.current.find(n => n.id === a),
      b: nodesRef.current.find(n => n.id === b),
    }));

    const simulate = () => {
      const nodes = nodesRef.current;
      const vels  = velRef.current;
      const cx    = W / 2, cy = H / 2;
      pulseRef.current += 0.05;

      // Force simulation
      nodes.forEach((n, i) => {
        // Spring to center
        vels[i].vx += (cx - n.x) * 0.003;
        vels[i].vy += (cy - n.y) * 0.003;
        // Channel attraction
        if (n.id !== 'ch1') {
          const ch = nodes[0];
          vels[i].vx += (ch.x - n.x) * 0.006;
          vels[i].vy += (ch.y - n.y) * 0.006;
        }
        // Node repulsion
        nodes.forEach((m, j) => {
          if (i === j) return;
          const dx = n.x - m.x, dy = n.y - m.y;
          const d2 = dx*dx + dy*dy + 1;
          const f = 2000 / d2;
          vels[i].vx += dx * f;
          vels[i].vy += dy * f;
        });
        vels[i].vx *= 0.85;
        vels[i].vy *= 0.85;
        n.x = Math.max(30, Math.min(W - 30, n.x + vels[i].vx));
        n.y = Math.max(30, Math.min(H - 30, n.y + vels[i].vy));
      });
    };

    const draw = () => {
      simulate();
      ctx.clearRect(0, 0, W, H);

      // Edges
      getEdgePairs().forEach(({ a, b }) => {
        if (!a || !b) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(0,245,212,0.12)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Nodes
      nodesRef.current.forEach(n => {
        const cfg = NODE_COLORS[n.type];
        const isHov = hovRef.current === n.id;
        const isBot = n.type === 'bot' || n.type === 'botcluster';
        const pulse = isBot ? Math.sin(pulseRef.current + n.x * 0.01) * 0.3 + 0.7 : 1;

        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, cfg.radius * 2.5);
        grd.addColorStop(0, cfg.glow + '55');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, cfg.radius * 2.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHov ? cfg.radius * 1.3 : cfg.radius, 0, Math.PI * 2);
        ctx.fillStyle = cfg.fill;
        ctx.globalAlpha = pulse;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = isHov ? '#fff' : cfg.glow + '99';
        ctx.lineWidth = isHov ? 2.5 : 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = isHov ? '#ffffff' : '#94a3b8';
        ctx.font = `${isHov ? 600 : 500} 9px ui-sans-serif,system-ui,sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + cfg.radius + 11);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let found = null;
    nodesRef.current.forEach(n => {
      const cfg = NODE_COLORS[n.type];
      const d = Math.hypot(n.x - mx, n.y - my);
      if (d < cfg.radius + 6) found = n;
    });
    hovRef.current = found ? found.id : null;
    setTooltip(found ? { node: found, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10 } : null);
  };

  const LEGEND = [
    { color: '#ef4444', label: 'Bot node' },
    { color: '#64748b', label: 'Shared account node' },
    { color: '#3b82f6', label: 'Channel node' },
    { color: '#f97316', label: 'Bot cluster' },
  ];

  return (
    <div style={card}>
      <h2 style={{ color: '#00f5d4', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
        Coordination Network Graph
      </h2>
      <p style={{ color: '#475569', fontSize: 11, marginBottom: 16 }}>
        Bot clusters, shared accounts &amp; forwarding chains — hover a node for details
      </p>

      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={800} height={420}
          style={{ width: '100%', height: 'auto', borderRadius: 8, background: 'rgba(0,0,0,0.3)', cursor: 'crosshair', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { hovRef.current = null; setTooltip(null); }}
        />
        {tooltip && (
          <div style={{
            position: 'absolute', left: tooltip.x, top: tooltip.y, pointerEvents: 'none',
            background: '#0d1526', border: '1px solid rgba(0,245,212,0.4)',
            borderRadius: 8, padding: '8px 12px', fontSize: 11, minWidth: 160, zIndex: 10,
          }}>
            <div style={{ color: '#00f5d4', fontWeight: 700, marginBottom: 4 }}>{tooltip.node.label}</div>
            <div style={{ color: '#94a3b8' }}>Posts: <strong style={{ color: '#e2e8f0' }}>{tooltip.node.posts.toLocaleString()}</strong></div>
            <div style={{ color: '#94a3b8' }}>Coordination Score: <strong style={{ color: tooltip.node.score > 85 ? '#ef4444' : '#facc15' }}>{tooltip.node.score}</strong></div>
            <div style={{ color: '#94a3b8', textTransform: 'capitalize' }}>Type: <strong style={{ color: '#e2e8f0' }}>{tooltip.node.type}</strong></div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            <span style={{ color: '#64748b', fontSize: 11 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
