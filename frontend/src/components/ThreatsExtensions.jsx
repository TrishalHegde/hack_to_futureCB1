import React from 'react';

const BotArcGauge = ({ value = 0 }) => {
  const r = 62, cx = 90, cy = 95;
  const toRad = d => d * Math.PI / 180;
  const pt = (a) => ({ x: cx + r * Math.cos(toRad(a)), y: cy + r * Math.sin(toRad(a)) });
  const sA = -210, tA = 240;
  const eA = sA + (value / 100) * tA;
  const s = pt(sA), e = pt(eA), bg = pt(sA + tA);
  const large = tA * (value / 100) > 180 ? 1 : 0;
  const needle = pt(eA);
  const color = value > 70 ? '#ef4444' : value > 40 ? '#facc15' : '#22c55e';
  return (
    <svg width={180} height={130} viewBox="0 0 180 130">
      <defs>
        <linearGradient id="bG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f5d4" /><stop offset="50%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${bg.x} ${bg.y}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={13} strokeLinecap="round" />
      {value > 0 && <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`} fill="none" stroke="url(#bG)" strokeWidth={13} strokeLinecap="round" />}
      <circle cx={needle.x} cy={needle.y} r={5} fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={26} fontWeight={900} fill={color} fontFamily="monospace">{Math.round(value)}</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize={9} fill="#475569" fontWeight={700}>BOT ACTIVITY INDEX</text>
    </svg>
  );
};

const Bar = ({ pct, color }) => (
  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, boxShadow: `0 0 6px ${color}80`, borderRadius: 4, transition: 'width 1s ease' }} />
  </div>
);

const CRow = ({ label, desc, value, pct, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <p style={{ color: '#475569', fontSize: 9, margin: '2px 0 0' }}>{desc}</p>
      </div>
      <span style={{ color, fontWeight: 700, fontSize: 12, fontFamily: 'monospace', marginLeft: 8, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
    <Bar pct={pct} color={color} />
  </div>
);



const CARD = { background: '#0d1526', border: '1px solid rgba(0,245,212,0.15)', borderRadius: 12, padding: 20 };

export const BotActivityCard = ({ liveData = [], isLive, lastUpdated }) => {
  const total = liveData.length || 1;
  const falseCount = liveData.filter(d => (d.verdict || '').includes('FALSE')).length;
  const botIndex = Math.round((falseCount / total) * 100);


  const texts = liveData.map(d => (d.text || '').slice(0, 40));
  const duplicates = texts.length - new Set(texts).size;

  const catMap = {};
  liveData.forEach(d => { const k = d.category || 'General'; catMap[k] = (catMap[k] || 0) + 1; });
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  const topPct = topCat ? Math.round((topCat[1] / total) * 100) : 0;

  const times = liveData.map(d => new Date(d.timestamp).getTime()).filter(Boolean).sort((a, b) => a - b);
  let coordinated = 0;
  for (let i = 1; i < times.length; i++) if (times[i] - times[i - 1] < 60000) coordinated++;

  const cats = Object.keys(catMap).length;
  const multiLang = cats >= 3 ? cats : 0;

  const botProb = botIndex > 70 ? 'HIGH' : botIndex > 40 ? 'MEDIUM' : 'LOW';
  const probColor = botProb === 'HIGH' ? '#ef4444' : botProb === 'MEDIUM' ? '#facc15' : '#22c55e';

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ color: '#00f5d4', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Bot Activity Intelligence</h2>
        {isLive && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 700 }}>LIVE</span>
        </div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <BotArcGauge value={botIndex} />
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
        <p style={{ color: '#475569', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, margin: '0 0 12px' }}>Detection Criteria</p>
        <CRow label="Posting Frequency" desc="Rapid repeated posting detected" value={`${duplicates} duplicates`} pct={Math.min(duplicates * 15, 100)} color={duplicates > 5 ? '#ef4444' : '#facc15'} />
        <CRow label="Source Concentration" desc="Claims from single source nodes" value={topCat ? `${topCat[0]} — ${topPct}%` : 'N/A'} pct={topPct} color="#a855f7" />
        <CRow label="Coordinated Timing" desc="Claims within 60-second windows" value={`${coordinated} clusters`} pct={Math.min(coordinated * 20, 100)} color="#f97316" />
        <CRow label="Language Pattern Anomaly" desc="Narrative across 3+ categories" value={multiLang >= 3 ? `${multiLang} detected` : 'None'} pct={multiLang >= 3 ? 75 : 5} color="#00f5d4" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, background: probColor + '20', border: `1px solid ${probColor}50`, color: probColor, fontSize: 11, fontWeight: 700 }}>
          Bot Probability: {botProb}
        </span>
        {botIndex > 60 && (
          <span style={{ padding: '3px 10px', borderRadius: 20, background: '#ef444420', border: '1px solid #ef444450', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>
            ⚠ Human Review Required
          </span>
        )}
        <span style={{ color: '#334155', fontSize: 9, marginLeft: 'auto' }}>Updated: {lastUpdated || '—'}</span>
      </div>
    </div>
  );
};
