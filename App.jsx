import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// --- Helpers ---
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function buildMonthGrid(date) {
  const start = startOfMonth(date);
  const days = [];
  const startPoint = new Date(start);
  startPoint.setDate(start.getDate() - (start.getDay() || 0));
  for (let i = 0; i < 42; i++) { days.push(new Date(startPoint)); startPoint.setDate(startPoint.getDate() + 1); }
  return days;
}
const getStatColor = (p) => { if (p < 60) return "#ef4444"; if (p < 70) return "#facc15"; return "#22c55e"; };

const StatRing = ({ percent, label }) => {
  const color = getStatColor(percent);
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ height: '65px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{value:percent},{value:100-percent}]} innerRadius={18} outerRadius={25} dataKey="value" startAngle={90} endAngle={450}>
              <Cell fill={color}/><Cell fill="#334155"/>
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.65rem', fontWeight: '900', color: 'white' }}>{percent}%</div>
      </div>
      <div style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#94a3b8' }}>{label}</div>
    </div>
  );
};

export default function BallerPro() {
  const todayDate = new Date();
  const [page, setPage] = useState("calendar");
  const [notes, setNotes] = useState("");
  const [tempNotes, setTempNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [shotSessions, setShotSessions] = useState([]);
  const [seasons, setSeasons] = useState(["Winter 2026", "Summer 2026"]);
  const [activeSeason, setActiveSeason] = useState("Winter 2026");

  const [m3, setM3] = useState(""); const [a3, setA3] = useState("");
  const [mMid, setMMid] = useState(""); const [aMid, setAMid] = useState("");
  const [mLay, setMLay] = useState(""); const [aLay, setALay] = useState("");
  const [mFt, setMFt] = useState(""); const [aFt, setAFt] = useState("");
  const [pts, setPts] = useState(""); const [reb, setReb] = useState("");
  const [ast, setAst] = useState(""); const [tov, setTov] = useState("");
  const [planTitle, setPlanTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("baller_final_v10");
    if (saved) {
      const d = JSON.parse(saved);
      setShotSessions(d.shots || []);
      setNotes(d.notes || "");
      setTempNotes(d.notes || "");
      setEvents(d.events || {});
      if(d.seasons) setSeasons(d.seasons);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("baller_final_v10", JSON.stringify({ shots: shotSessions, notes, events, seasons }));
  }, [shotSessions, notes, events, seasons]);

  const addSeason = () => {
    const name = prompt("New Season Name:");
    if (name && !seasons.includes(name)) { setSeasons([...seasons, name]); setActiveSeason(name); }
  };

  const addSession = () => {
    const m3n = parseInt(m3)||0; const a3n = parseInt(a3)||0;
    const mMn = parseInt(mMid)||0; const aMn = parseInt(aMid)||0;
    const mLn = parseInt(mLay)||0; const aLn = parseInt(aLay)||0;
    const mFn = parseInt(mFt)||0; const aFn = parseInt(aFt)||0;
    const totM = m3n + mMn + mLn; const totA = a3n + aMn + aLn;
    const session = {
      id: Date.now(), date: new Date().toLocaleDateString(), season: activeSeason,
      fg: totA > 0 ? Math.round((totM/totA)*100) : 0, ft: aFn > 0 ? Math.round((mFn/aFn)*100) : 0,
      p3: a3n > 0 ? Math.round((m3n/a3n)*100) : 0, pMid: aMn > 0 ? Math.round((mMn/aMn)*100) : 0, pLay: aLn > 0 ? Math.round((mLn/aLn)*100) : 0,
      box: { pts: parseInt(pts)||0, reb: parseInt(reb)||0, ast: parseInt(ast)||0, tov: parseInt(tov)||0 }
    };
    setShotSessions([session, ...shotSessions]);
    setM3(""); setA3(""); setMMid(""); setAMid(""); setMLay(""); setALay(""); setMFt(""); setAFt(""); setPts(""); setReb(""); setAst(""); setTov("");
  };

  const careerTotals = shotSessions.reduce((acc, s) => ({
    pts: acc.pts + (s.box?.pts || 0), reb: acc.reb + (s.box?.reb || 0), ast: acc.ast + (s.box?.ast || 0), tov: acc.tov + (s.box?.tov || 0)
  }), { pts:0, reb:0, ast:0, tov:0 });

  const latest = shotSessions.filter(s => s.season === activeSeason)[0] || { fg:0, ft:0, p3:0, pMid:0, pLay:0, box: {pts:0, reb:0, ast:0, tov:0} };

  const s = {
    container: { maxWidth: '450px', margin: '0 auto', padding: '15px', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    input: { width: '45px', backgroundColor: '#334155', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center' },
    navBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', backgroundColor: active ? '#ea580c' : '#1e293b', color: active ? 'white' : '#94a3b8' })
  };

  return (
    <div style={s.container}>
      <header style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ color: '#ea580c', fontStyle: 'italic', margin: 0, fontSize: '2rem' }}>BALLER PRO</h1>
        <div style={{display:'flex', justifyContent:'center', gap:'8px', marginTop: '8px'}}>
           <select style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', padding:'6px', borderRadius:'10px', fontSize: '0.8rem' }} value={activeSeason} onChange={e => setActiveSeason(e.target.value)}>
             {seasons.map(sn => <option key={sn} value={sn}>{sn}</option>)}
           </select>
           <button onClick={addSeason} style={{background:'#334155', color:'white', border:'none', borderRadius:'10px', padding:'0 12px', fontSize:'0.75rem', fontWeight:'bold'}}>+ SEASON</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <button style={s.navBtn(page === 'calendar')} onClick={() => setPage('calendar')}>📅</button>
        <button style={s.navBtn(page === 'stats')} onClick={() => setPage('stats')}>📊</button>
        <button style={s.navBtn(page === 'career')} onClick={() => setPage('career')}>🏆</button>
        <button style={s.navBtn(page === 'notes')} onClick={() => setPage('notes')}>📝</button>
      </div>

      {page === 'calendar' && (
        <div style={{animation: 'fadeIn 0.2s'}}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))} style={{background:'none', border:'none', color:'white', fontSize:'1.2rem'}}>‹</button>
              <b>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</b>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))} style={{background:'none', border:'none', color:'white', fontSize:'1.2rem'}}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {buildMonthGrid(currentMonth).map((d, i) => {
                const dateKey = d.toDateString();
                const isSelected = dateKey === selectedDate.toDateString();
                const isToday = dateKey === todayDate.toDateString();
                const hasPlans = events[dateKey] && events[dateKey].length > 0;
                return (
                  <div key={i} onClick={() => setSelectedDate(d)} style={{ 
                    height: '42px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.8rem', 
                    backgroundColor: isSelected ? '#ea580c' : 'transparent', 
                    border: isToday && !isSelected ? '2px solid #ea580c' : 'none',
                    color: d.getMonth() !== currentMonth.getMonth() ? '#475569' : 'white',
                    position: 'relative'
                  }}>
                    {d.getDate()}
                    {hasPlans && <div style={{ width: '4px', height: '4px', backgroundColor: isSelected ? 'white' : '#ea580c', borderRadius: '50%', position: 'absolute', bottom: '4px' }}></div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={s.card}>
            <h4 style={{margin:'0 0 10px 0', fontSize:'0.8rem', color:'#ea580c'}}>ADD PLAN FOR {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'short' })}</h4>
            <div style={{display:'flex', gap:'8px'}}>
              <input style={{flex:1, padding:'10px', borderRadius:'10px', backgroundColor:'#334155', border:'none', color:'white', outline:'none'}} placeholder="e.g. 500 Makes" value={planTitle} onChange={e=>setPlanTitle(e.target.value)} />
              <button onClick={() => { if(planTitle){ setEvents({...events, [selectedDate.toDateString()]: [...(events[selectedDate.toDateString()]||[]), {title:planTitle}]}); setPlanTitle(""); } }} style={{padding:'10px 20px', backgroundColor:'#ea580c', border:'none', color:'white', borderRadius:10, fontWeight:'bold'}}>ADD</button>
            </div>
          </div>

          {/* PLAN INDICATOR LIST */}
          <div style={{maxHeight:'200px', overflowY:'auto'}}>
            <h4 style={{margin:'5px 0 10px 10px', fontSize:'0.7rem', color:'#94a3b8', textTransform:'uppercase'}}>Agenda</h4>
            {(events[selectedDate.toDateString()] || []).length === 0 ? <p style={{fontSize:'0.8rem', color:'#475569', marginLeft:'10px'}}>No plans for this date.</p> :
              events[selectedDate.toDateString()].map((p, i) => (
                <div key={i} style={{...s.card, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 18px'}}>
                   <span style={{fontSize:'0.9rem'}}>🏀 {p.title}</span>
                   <button onClick={() => { const updated = events[selectedDate.toDateString()].filter((_,idx) => idx !== i); setEvents({...events, [selectedDate.toDateString()]: updated}); }} style={{background:'none', border:'none', color:'#475569'}}>✕</button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* OTHER PAGES REMAIN THE SAME FOR STABILITY */}
      {page === 'stats' && (
        <div style={{animation: 'fadeIn 0.2s'}}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
              <StatRing label="3PT" percent={latest.p3} />
              <StatRing label="MID" percent={latest.pMid} />
              <StatRing label="LAY" percent={latest.pLay} />
              <StatRing label="FT" percent={latest.ft} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.pts}</div><div style={{fontSize:'0.55rem', color:'#94a3b8'}}>PTS</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.reb}</div><div style={{fontSize:'0.55rem', color:'#94a3b8'}}>REB</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.ast}</div><div style={{fontSize:'0.55rem', color:'#94a3b8'}}>AST</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.tov}</div><div style={{fontSize:'0.55rem', color:'#94a3b8'}}>TOV</div></div>
            </div>
          </div>
          <div style={s.card}>
            <h4 style={{marginTop:0, fontSize:'0.8rem', color:'#ea580c', textAlign:'center'}}>LOG SESSION</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px', marginTop:'10px' }}>
              <div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'6px'}}>3PT <div style={{display:'flex', gap:'2px'}}><input style={s.input} value={m3} onChange={e=>setM3(e.target.value)}/>/<input style={s.input} value={a3} onChange={e=>setA3(e.target.value)}/></div></div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'6px'}}>MID <div style={{display:'flex', gap:'2px'}}><input style={s.input} value={mMid} onChange={e=>setMMid(e.target.value)}/>/<input style={s.input} value={aMid} onChange={e=>setAMid(e.target.value)}/></div></div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'6px'}}>LAY <div style={{display:'flex', gap:'2px'}}><input style={s.input} value={mLay} onChange={e=>setMLay(e.target.value)}/>/<input style={s.input} value={aLay} onChange={e=>setALay(e.target.value)}/></div></div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem'}}>FT <div style={{display:'flex', gap:'2px'}}><input style={s.input} value={mFt} onChange={e=>setMFt(e.target.value)}/>/<input style={s.input} value={aFt} onChange={e=>setAFt(e.target.value)}/></div></div>
              </div>
              <div style={{borderLeft:'1px solid #334155', paddingLeft:'15px'}}>
                <div style={{fontSize:'0.75rem', marginBottom:'6px'}}>PTS <input style={{...s.input, width:'50px'}} value={pts} onChange={e=>setPts(e.target.value)}/></div>
                <div style={{fontSize:'0.75rem', marginBottom:'6px'}}>REB <input style={{...s.input, width:'50px'}} value={reb} onChange={e=>setReb(e.target.value)}/></div>
                <div style={{fontSize:'0.75rem', marginBottom:'6px'}}>AST <input style={{...s.input, width:'50px'}} value={ast} onChange={e=>setAst(e.target.value)}/></div>
                <div style={{fontSize:'0.75rem'}}>TOV <input style={{...s.input, width:'50px'}} value={tov} onChange={e=>setTov(e.target.value)}/></div>
              </div>
            </div>
            <button onClick={addSession} style={{ width: '100%', padding: '14px', backgroundColor: '#ea580c', border: 'none', color: 'white', borderRadius: '15px', fontWeight: 'bold', marginTop: '15px' }}>SAVE SESSION</button>
          </div>
        </div>
      )}

      {page === 'career' && (
        <div style={{...s.card, textAlign:'center', padding:'30px 15px'}}>
           <div style={{fontSize:'0.7rem', color:'#94a3b8', textTransform:'uppercase'}}>Total Career Points</div>
           <div style={{fontSize:'4rem', fontWeight:'900', color:'#ea580c'}}>{careerTotals.pts}</div>
           <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:20}}>
              <div><div style={{fontSize:'0.6rem', color:'#94a3b8'}}>REB</div><div>{careerTotals.reb}</div></div>
              <div><div style={{fontSize:'0.6rem', color:'#94a3b8'}}>AST</div><div>{careerTotals.ast}</div></div>
              <div><div style={{fontSize:'0.6rem', color:'#94a3b8'}}>TOV</div><div>{careerTotals.tov}</div></div>
           </div>
        </div>
      )}

      {page === 'notes' && (
        <div>
          <textarea style={{ width: '100%', height: '62vh', borderRadius: '20px', padding: '18px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none', boxSizing:'border-box', fontSize:'1rem' }} value={tempNotes} onChange={e => setTempNotes(e.target.value)} />
          <button style={{ width: '100%', backgroundColor: isSaved ? '#22c55e' : '#ea580c', color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', marginTop: '12px' }} onClick={() => { setNotes(tempNotes); setIsSaved(true); setTimeout(()=>setIsSaved(false), 2000); }}>
            {isSaved ? "✅ SAVED" : "💾 SAVE NOTES"}
          </button>
        </div>
      )}
    </div>
  );
}

import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<BallerPro />);
