import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// --- Helper Functions ---
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthGrid(date) {
  const start = startOfMonth(date);
  const dayOfWeek = start.getDay();
  const days = [];
  const startPoint = new Date(start);
  startPoint.setDate(start.getDate() - dayOfWeek);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(startPoint));
    startPoint.setDate(startPoint.getDate() + 1);
  }
  return days;
}

const getStatColor = (percent) => {
  if (percent < 60) return "#ef4444"; 
  if (percent < 70) return "#facc15"; 
  return "#22c55e"; 
};

const StatRing = ({ percent, label }) => {
  const color = getStatColor(percent);
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ height: '70px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ value: percent }, { value: 100 - percent }]} innerRadius={22} outerRadius={30} paddingAngle={2} dataKey="value" startAngle={90} endAngle={450}>
              <Cell fill={color} cornerRadius={4} />
              <Cell fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: '900' }}>{percent}%</div>
      </div>
      <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#94a3b8', marginTop: '2px' }}>{label}</div>
    </div>
  );
};

export default function BasketballPlanner() {
  const today = new Date();
  const [page, setPage] = useState("calendar");
  const [notes, setNotes] = useState("");
  const [tempNotes, setTempNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  const [shotSessions, setShotSessions] = useState([]);
  const [m3, setM3] = useState(""); const [a3, setA3] = useState("");
  const [mMid, setMMid] = useState(""); const [aMid, setAMid] = useState("");
  const [mLay, setMLay] = useState(""); const [aLay, setALay] = useState("");
  const [mFt, setMFt] = useState(""); const [aFt, setAFt] = useState("");
  const [planTitle, setPlanTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ballerMasterDataV9");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
      setTempNotes(data.notes || "");
      setEvents(data.events || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballerMasterDataV9", JSON.stringify({ shots: shotSessions, notes, events }));
  }, [shotSessions, notes, events]);

  const addShotSession = () => {
    const m3n = parseInt(m3) || 0; const a3n = parseInt(a3) || 0;
    const mMn = parseInt(mMid) || 0; const aMn = parseInt(aMid) || 0;
    const mLn = parseInt(mLay) || 0; const aLn = parseInt(aLay) || 0;
    const mFn = parseInt(mFt) || 0; const aFn = parseInt(aFt) || 0;

    const totM = m3n + mMn + mLn;
    const totA = a3n + aMn + aLn;
    
    if (totA === 0 && aFn === 0) return alert("Enter shots!");

    const session = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      fgPercent: totA > 0 ? Math.round((totM / totA) * 100) : 0,
      ftPercent: aFn > 0 ? Math.round((mFn / aFn) * 100) : 0,
      p3: a3n > 0 ? Math.round((m3n/a3n)*100) : 0,
      pMid: aMn > 0 ? Math.round((mMn/aMn)*100) : 0,
      pLay: aLn > 0 ? Math.round((mLn/aLn)*100) : 0,
    };

    setShotSessions([session, ...shotSessions]);
    setM3(""); setA3(""); setMMid(""); setAMid(""); setMLay(""); setALay(""); setMFt(""); setAFt("");
  };

  const deleteShotSession = (id) => {
    if (window.confirm("Delete this session?")) {
      setShotSessions(shotSessions.filter(s => s.id !== id));
    }
  };

  const latest = shotSessions[0] || { fgPercent: 0, ftPercent: 0, p3: 0, pMid: 0, pLay: 0 };
  const masterColor = getStatColor(latest.fgPercent);

  const s = {
    container: { maxWidth: '450px', margin: '0 auto', padding: '15px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh' },
    card: { backgroundColor: 'white', padding: '12px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '12px', border: '1px solid #f1f5f9' },
    nav: { display: 'flex', gap: '6px', marginBottom: '15px' },
    btn: (active) => ({ flex: 1, backgroundColor: active ? '#ea580c' : '#f8fafc', color: active ? 'white' : '#64748b', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }),
    input: { width: '40px', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', textAlign: 'center' }
  };

  return (
    <div style={s.container}>
      <header style={{ marginBottom: '15px', textAlign: 'center' }}><h1 style={{ color: '#ea580c', fontWeight: '900', fontStyle: 'italic', margin: 0, fontSize: '1.8rem' }}>BALLER PRO</h1></header>

      <div style={s.nav}>
        <button style={s.btn(page === 'calendar')} onClick={() => setPage("calendar")}>📅 PLAN</button>
        <button style={s.btn(page === 'shooting')} onClick={() => setPage("shooting")}>🎯 SHOTS</button>
        <button style={s.btn(page === 'notes')} onClick={() => setPage("notes")}>📝 NOTES</button>
      </div>

      {page === "shooting" && (
        <div>
          <div style={{ ...s.card, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color:'#94a3b8' }}>COMBINED FIELD GOAL %</h3>
            <div style={{ height: '120px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{value:latest.fgPercent},{value:100-latest.fgPercent}]} innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value" startAngle={90} endAngle={450}>
                    <Cell fill={masterColor} cornerRadius={10} /><Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.4rem', fontWeight: '900', color: masterColor }}>{latest.fgPercent}%</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
              <StatRing label="3PTS" percent={latest.p3} />
              <StatRing label="MID" percent={latest.pMid} />
              <StatRing label="LAYUP" percent={latest.pLay} />
              <StatRing label="FT" percent={latest.ftPercent} />
            </div>

            <div style={{ marginTop: '20px', background: '#f8fafc', padding: '12px', borderRadius: '15px' }}>
              {[ {l:'3PTS', m:m3, sm:setM3, a:a3, sa:setA3}, {l:'MID', m:mMid, sm:setMMid, a:aMid, sa:setAMid}, {l:'LAY', m:mLay, sm:setMLay, a:aLay, sa:setALay}, {l:'FT', m:mFt, sm:setMFt, a:aFt, sa:setAFt} ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>{row.l}</span>
                  <div><input style={s.input} placeholder="M" value={row.m} onChange={e=>row.sm(e.target.value)}/> / <input style={s.input} placeholder="A" value={row.a} onChange={e=>row.sa(e.target.value)}/></div>
                </div>
              ))}
              <button onClick={addShotSession} style={{ width:'100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', marginTop: '5px' }}>SAVE SESSION</button>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '5px', marginBottom: '10px' }}>HISTORY</h4>
            {shotSessions.map(sess => (
              <div key={sess.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{sess.date}</div>
                  <div style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 'bold' }}>FG: {sess.fgPercent}% | FT: {sess.ftPercent}%</div>
                </div>
                <button 
                  onClick={() => deleteShotSession(sess.id)} 
                  style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '5px 10px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "calendar" && (
        <div>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
               <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(startOfMonth(d)); }} style={{border:'none', background:'none'}}>‹</button>
               <b style={{fontSize: '0.9rem'}}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</b>
               <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(startOfMonth(d)); }} style={{border:'none', background:'none'}}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {buildMonthGrid(currentMonth).map((date, i) => (
                <div key={i} onClick={() => setSelectedDate(date)} style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.85rem', backgroundColor: date.toDateString() === selectedDate.toDateString() ? '#ea580c' : 'transparent', color: date.toDateString() === selectedDate.toDateString() ? 'white' : '#1e293b' }}>{date.getDate()}</div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <input style={{...s.input, width:'100%', textAlign:'left', marginBottom:'10px'}} placeholder="What's the plan?" value={planTitle} onChange={e => setPlanTitle(e.target.value)} />
            <button onClick={() => { if(planTitle) { setEvents({...events, [selectedDate.toDateString()]: [...(events[selectedDate.toDateString()]||[]), {title:planTitle}]}); setPlanTitle(""); } }} style={{ width:'100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '10px', borderRadius: '10px' }}>ADD PLAN</button>
          </div>
        </div>
      )}

      {page === "notes" && (
        <div>
          <textarea style={{ width: '100%', height: '60vh', borderRadius: '20px', padding: '15px', border: '1px solid #e2e8f0', outline: 'none' }} value={tempNotes} onChange={e => setTempNotes(e.target.value)} />
          <button style={{ width: '100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', marginTop: '10px' }} onClick={() => { setNotes(tempNotes); setIsSaved(true); setTimeout(()=>setIsSaved(false),2000); }}>{isSaved ? "✅ SAVED!" : "💾 SAVE NOTES"}</button>
        </div>
      )}
    </div>
  );
}

import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<BasketballPlanner />);
