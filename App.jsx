import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// --- Helpers ---
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function buildMonthGrid(date) {
  const start = startOfMonth(date);
  const days = [];
  const startPoint = new Date(start);
  startPoint.setDate(start.getDate() - start.getDay());
  for (let i = 0; i < 42; i++) { days.push(new Date(startPoint)); startPoint.setDate(startPoint.getDate() + 1); }
  return days;
}
const getStatColor = (p) => { if (p < 60) return "#ef4444"; if (p < 70) return "#facc15"; return "#22c55e"; };

const StatRing = ({ percent, label }) => {
  const color = getStatColor(percent);
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ height: '60px', position: 'relative' }}>
        <ResponsiveContainer><PieChart><Pie data={[{value:percent},{value:100-percent}]} innerRadius={18} outerRadius={25} dataKey="value" startAngle={90} endAngle={450}><Cell fill={color}/><Cell fill="#334155"/></Pie></PieChart></ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.6rem', fontWeight: '900', color: 'white' }}>{percent}%</div>
      </div>
      <div style={{ fontSize: '0.5rem', fontWeight: 'bold', color: '#94a3b8' }}>{label}</div>
    </div>
  );
};

export default function BallerPro() {
  const [page, setPage] = useState("calendar");
  const [notes, setNotes] = useState("");
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  // Season & Stats States
  const [shotSessions, setShotSessions] = useState([]);
  const [seasons, setSeasons] = useState(["Winter 2026"]);
  const [activeSeason, setActiveSeason] = useState("Winter 2026");
  
  // Input States
  const [m3, setM3] = useState(""); const [a3, setA3] = useState("");
  const [mMid, setMMid] = useState(""); const [aMid, setAMid] = useState("");
  const [mLay, setMLay] = useState(""); const [aLay, setALay] = useState("");
  const [mFt, setMFt] = useState(""); const [aFt, setAFt] = useState("");
  const [pts, setPts] = useState(""); const [reb, setReb] = useState("");
  const [ast, setAst] = useState(""); const [tov, setTov] = useState("");
  const [planTitle, setPlanTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ballerCareerFinalV1");
    if (saved) {
      const d = JSON.parse(saved);
      setShotSessions(d.shots || []);
      setNotes(d.notes || "");
      setEvents(d.events || {});
      if(d.seasons) setSeasons(d.seasons);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballerCareerFinalV1", JSON.stringify({ shots: shotSessions, notes, events, seasons }));
  }, [shotSessions, notes, events, seasons]);

  const addSeason = () => {
    const name = prompt("Enter Season Name (e.g. AAU Summer):");
    if (name && !seasons.includes(name)) {
      setSeasons([...seasons, name]);
      setActiveSeason(name);
    }
  };

  const addSession = () => {
    const m3n = parseInt(m3)||0; const a3n = parseInt(a3)||0;
    const mMn = parseInt(mMid)||0; const aMn = parseInt(aMid)||0;
    const mLn = parseInt(mLay)||0; const aLn = parseInt(aLay)||0;
    const mFn = parseInt(mFt)||0; const aFn = parseInt(aFt)||0;
    const totalM = m3n + mMn + mLn; const totalA = a3n + aMn + aLn;

    const session = {
      id: Date.now(), date: new Date().toLocaleDateString(), season: activeSeason,
      fg: totalA > 0 ? Math.round((totalM/totalA)*100) : 0,
      ft: aFn > 0 ? Math.round((mFn/aFn)*100) : 0,
      p3: a3n > 0 ? Math.round((m3n/a3n)*100) : 0,
      pMid: aMn > 0 ? Math.round((mMn/aMn)*100) : 0,
      pLay: aLn > 0 ? Math.round((mLn/aLn)*100) : 0,
      box: { pts: parseInt(pts)||0, reb: parseInt(reb)||0, ast: parseInt(ast)||0, tov: parseInt(tov)||0 }
    };
    setShotSessions([session, ...shotSessions]);
    setM3(""); setA3(""); setMMid(""); setAMid(""); setMLay(""); setALay(""); setMFt(""); setAFt("");
    setPts(""); setReb(""); setAst(""); setTov("");
  };

  const deleteSession = (id) => { if(window.confirm("Delete session?")) setShotSessions(shotSessions.filter(s => s.id !== id)); };

  // Calculation Logic
  const filteredShots = shotSessions.filter(s => s.season === activeSeason);
  const latest = filteredShots[0] || { fg:0, ft:0, p3:0, pMid:0, pLay:0, box: {pts:0, reb:0, ast:0, tov:0} };
  
  const careerTotals = shotSessions.reduce((acc, s) => ({
    pts: acc.pts + (s.box?.pts || 0),
    reb: acc.reb + (s.box?.reb || 0),
    ast: acc.ast + (s.box?.ast || 0),
    tov: acc.tov + (s.box?.tov || 0)
  }), { pts:0, reb:0, ast:0, tov:0 });

  const s = {
    container: { maxWidth: '450px', margin: '0 auto', padding: '15px', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #334155' },
    input: { width: '45px', backgroundColor: '#334155', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center' },
    navBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', backgroundColor: active ? '#ea580c' : '#1e293b', color: active ? 'white' : '#94a3b8' }),
    totalLabel: {fontSize:'0.6rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px'}
  };

  return (
    <div style={s.container}>
      <header style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ color: '#ea580c', fontStyle: 'italic', margin: 0, fontSize: '2rem' }}>BALLER PRO</h1>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'10px'}}>
           <select style={{ background: '#1e293b', color: 'white', border: 'none', padding:'5px', borderRadius:'5px' }} value={activeSeason} onChange={e => setActiveSeason(e.target.value)}>
             {seasons.map(sn => <option key={sn} value={sn}>{sn}</option>)}
           </select>
           <button onClick={addSeason} style={{background:'#334155', color:'white', border:'none', borderRadius:'5px', padding:'5px 10px', fontSize:'0.8rem'}}>+ Season</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <button style={s.navBtn(page === 'calendar')} onClick={() => setPage('calendar')}>📅</button>
        <button style={s.navBtn(page === 'stats')} onClick={() => setPage('stats')}>📊</button>
        <button style={s.navBtn(page === 'career')} onClick={() => setPage('career')}>🏆</button>
        <button style={s.navBtn(page === 'notes')} onClick={() => setPage('notes')}>📝</button>
      </div>

      {page === 'career' && (
        <div style={{animation: 'fadeIn 0.3s'}}>
          <h2 style={{fontSize:'1rem', color:'#94a3b8', marginBottom:'15px'}}>CAREER TOTALS</h2>
          <div style={{...s.card, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', textAlign:'center'}}>
            <div><div style={s.totalLabel}>All-Time Points</div><div style={{fontSize:'2rem', fontWeight:'900', color:'#ea580c'}}>{careerTotals.pts}</div></div>
            <div><div style={s.totalLabel}>All-Time Rebounds</div><div style={{fontSize:'2rem', fontWeight:'900', color:'#ea580c'}}>{careerTotals.reb}</div></div>
            <div><div style={s.totalLabel}>All-Time Assists</div><div style={{fontSize:'2rem', fontWeight:'900', color:'#ea580c'}}>{careerTotals.ast}</div></div>
            <div><div style={s.totalLabel}>All-Time Turnovers</div><div style={{fontSize:'2rem', fontWeight:'900', color:'#ea580c'}}>{careerTotals.tov}</div></div>
          </div>
          <p style={{fontSize:'0.7rem', color:'#64748b', textAlign:'center'}}>* Totals are combined from every season logged.</p>
        </div>
      )}

      {page === 'stats' && (
        <div>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
              <StatRing label="3PT" percent={latest.p3} />
              <StatRing label="MID" percent={latest.pMid} />
              <StatRing label="LAY" percent={latest.pLay} />
              <StatRing label="FT" percent={latest.ft} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.pts}</div><div style={{fontSize:'0.6rem', color:'#94a3b8'}}>PTS</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.reb}</div><div style={{fontSize:'0.6rem', color:'#94a3b8'}}>REB</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.ast}</div><div style={{fontSize:'0.6rem', color:'#94a3b8'}}>AST</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#ea580c'}}>{latest.box.tov}</div><div style={{fontSize:'0.6rem', color:'#94a3b8'}}>TOV</div></div>
            </div>
          </div>

          <div style={s.card}>
            <h4 style={{marginTop:0, fontSize:'0.8rem', color:'#ea580c'}}>LOG PERFORMANCE</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px' }}>
              <div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}><span>3PT</span><div><input style={s.input} value={m3} onChange={e=>setM3(e.target.value)}/>/<input style={s.input} value={a3} onChange={e=>setA3(e.target.value)}/></div></div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}><span>MID</span><div><input style={s.input} value={mMid} onChange={e=>setMMid(e.target.value)}/>/<input style={s.input} value={aMid} onChange={e=>setAMid(e.target.value)}/></div></div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}><span>LAY</span><div><input style={s.input} value={mLay} onChange={e=>setMLay(e.target.value)}/>/<input style={s.input} value={aLay} onChange={e=>setALay(e.target.value)}/></div></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>FT</span><div><input style={s.input} value={mFt} onChange={e=>setMFt(e.target.value)}/>/<input style={s.input} value={aFt} onChange={e=>setAFt(e.target.value)}/></div></div>
              </div>
              <div style={{borderLeft:'1px solid #334155', paddingLeft:'15px'}}>
                <div style={{marginBottom:5}}>PTS <input style={{...s.input, width:'50px'}} value={pts} onChange={e=>setPts(e.target.value)}/></div>
                <div style={{marginBottom:5}}>REB <input style={{...s.input, width:'50px'}} value={reb} onChange={e=>setReb(e.target.value)}/></div>
                <div style={{marginBottom:5}}>AST <input style={{...s.input, width:'50px'}} value={ast} onChange={e=>setAst(e.target.value)}/></div>
                <div>TOV <input style={{...s.input, width:'50px'}} value={tov} onChange={e=>setTov(e.target.value)}/></div>
              </div>
            </div>
            <button onClick={addSession} style={{ width: '100%', padding: '12px', backgroundColor: '#ea580c', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', marginTop: '15px' }}>SAVE STATS</button>
          </div>
          
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {filteredShots.map(sess => (
              <div key={sess.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems:'center', padding:'10px 15px' }}>
                <div>
                  <div style={{fontSize:'0.8rem', fontWeight:'bold'}}>{sess.date}</div>
                  <div style={{fontSize:'0.65rem', color:'#ea580c'}}>{sess.box.pts} PTS | {sess.fg}% FG</div>
                </div>
                <button onClick={()=>deleteSession(sess.id)} style={{background:'none', border:'none', color:'#475569'}}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'calendar' && (
        <div>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <button onClick={() => setCurrentMonth(startOfMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1))))} style={{background:'none', border:'none', color:'white'}}>‹</button>
              <b>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</b>
              <button onClick={() => setCurrentMonth(startOfMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1))))} style={{background:'none', border:'none', color:'white'}}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
              {buildMonthGrid(currentMonth).map((d, i) => (
                <div key={i} onClick={() => setSelectedDate(d)} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '0.8rem', backgroundColor: d.toDateString() === selectedDate.toDateString() ? '#ea580c' : 'transparent' }}>{d.getDate()}</div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <input style={{width:'100%', padding:'10px', borderRadius:'8px', backgroundColor:'#334155', border:'none', color:'white', boxSizing:'border-box'}} placeholder="Schedule a workout..." value={planTitle} onChange={e=>setPlanTitle(e.target.value)} />
            <button onClick={() => { if(planTitle){ setEvents({...events, [selectedDate.toDateString()]: [...(events[selectedDate.toDateString()]||[]), {title:planTitle}]}); setPlanTitle(""); } }} style={{width:'100%', marginTop:10, padding:10, backgroundColor:'#ea580c', border:'none', color:'white', borderRadius:8, fontWeight:'bold'}}>ADD TO CALENDAR</button>
          </div>
        </div>
      )}

      {page === 'notes' && (
        <textarea style={{ width: '100%', height: '65vh', borderRadius: '20px', padding: '15px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none', boxSizing:'border-box' }} placeholder="Film study..." value={notes} onChange={e => setNotes(e.target.value)} />
      )}
    </div>
  );
}
