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

export default function BasketballPlanner() {
  const today = new Date();
  const [page, setPage] = useState("calendar");
  const [notes, setNotes] = useState("");
  const [tempNotes, setTempNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  // Shooting States
  const [shotSessions, setShotSessions] = useState([]);
  const [m3, setM3] = useState(""); const [a3, setA3] = useState("");
  const [mMid, setMMid] = useState(""); const [aMid, setAMid] = useState("");
  const [mLay, setMLay] = useState(""); const [aLay, setALay] = useState("");
  const [mFt, setMFt] = useState(""); const [aFt, setAFt] = useState("");

  const [planTitle, setPlanTitle] = useState("");
  const [planCategory, setPlanCategory] = useState("Skill Work");

  useEffect(() => {
    setSelectedDate(new Date());
    setCurrentMonth(startOfMonth(new Date()));
  }, [page]);

  useEffect(() => {
    const saved = localStorage.getItem("ballerMasterDataV6");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
      setTempNotes(data.notes || "");
      setEvents(data.events || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballerMasterDataV6", JSON.stringify({ shots: shotSessions, notes, events }));
  }, [shotSessions, notes, events]);

  const saveNotesManually = () => {
    setNotes(tempNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const addShotSession = () => {
    const made3 = parseInt(m3) || 0; const att3 = parseInt(a3) || 0;
    const madeMid = parseInt(mMid) || 0; const attMid = parseInt(aMid) || 0;
    const madeLay = parseInt(mLay) || 0; const attLay = parseInt(aLay) || 0;
    const madeFt = parseInt(mFt) || 0; const attFt = parseInt(aFt) || 0;

    const totalMadeFG = made3 + madeMid + madeLay;
    const totalAttFG = att3 + attMid + attLay;
    
    if (totalAttFG === 0 && attFt === 0) return alert("Enter some shots first!");

    const session = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      fgPercent: totalAttFG > 0 ? Math.round((totalMadeFG / totalAttFG) * 100) : 0,
      ftPercent: attFt > 0 ? Math.round((madeFt / attFt) * 100) : 0,
      details: { m3, a3, mMid, aMid, mLay, aLay, mFt, aFt }
    };

    setShotSessions([session, ...shotSessions]);
    setM3(""); setA3(""); setMMid(""); setAMid(""); setMLay(""); setALay(""); setMFt(""); setAFt("");
  };

  const deleteShot = (id) => setShotSessions(shotSessions.filter(s => s.id !== id));
  
  const addPlan = () => {
    if (!planTitle.trim()) return alert("Enter a title.");
    const key = selectedDate.toDateString();
    setEvents({ ...events, [key]: [...(events[key] || []), { category: planCategory, title: planTitle }] });
    setPlanTitle("");
  };

  const deletePlan = (dateKey, index) => {
    const updated = events[dateKey].filter((_, i) => i !== index);
    setEvents({ ...events, [dateKey]: updated });
  };

  const latest = shotSessions[0] || { fgPercent: 0, ftPercent: 0 };
  const pieData = [{ value: latest.fgPercent }, { value: 100 - latest.fgPercent }];

  const s = {
    container: { maxWidth: '450px', margin: '0 auto', padding: '15px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh', boxSizing: 'border-box' },
    card: { backgroundColor: 'white', padding: '12px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '12px', border: '1px solid #f1f5f9' },
    nav: { display: 'flex', gap: '6px', marginBottom: '15px' },
    btn: (active) => ({ flex: 1, backgroundColor: active ? '#ea580c' : '#f8fafc', color: active ? 'white' : '#64748b', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }),
    input: { width: '45px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', textAlign: 'center' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }
  };

  return (
    <div style={s.container}>
      <header style={{ marginBottom: '15px', textAlign: 'center' }}>
        <h1 style={{ color: '#ea580c', fontWeight: '900', fontStyle: 'italic', margin: 0, fontSize: '1.8rem' }}>BALLER PRO</h1>
      </header>

      <div style={s.nav}>
        <button style={s.btn(page === 'calendar')} onClick={() => setPage("calendar")}>📅 PLAN</button>
        <button style={s.btn(page === 'shooting')} onClick={() => setPage("shooting")}>🎯 SHOTS</button>
        <button style={s.btn(page === 'notes')} onClick={() => setPage("notes")}>📝 NOTES</button>
      </div>

      {page === "calendar" && (
        <div>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
               <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(startOfMonth(d)); }} style={{border:'none', background:'none', fontSize:'1.2rem'}}>‹</button>
               <b style={{fontSize: '0.9rem'}}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</b>
               <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(startOfMonth(d)); }} style={{border:'none', background:'none', fontSize:'1.2rem'}}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {['S','M','T','W','T','F','S'].map(d => <div key={d} style={{textAlign:'center', fontSize:'0.6rem', fontWeight:'900', color:'#cbd5e1'}}>{d}</div>)}
              {buildMonthGrid(currentMonth).map((date, i) => {
                const key = date.toDateString();
                const isSel = key === selectedDate.toDateString();
                const isToday = key === today.toDateString();
                const hasPlans = events[key] && events[key].length > 0;
                return (
                  <div key={i} onClick={() => setSelectedDate(date)} style={{
                    height: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer',
                    backgroundColor: isSel ? '#ea580c' : 'transparent', color: isSel ? 'white' : (date.getMonth() !== currentMonth.getMonth() ? '#cbd5e1' : '#1e293b'),
                    border: isToday && !isSel ? '1.5px solid #ea580c' : 'none', position: 'relative'
                  }}>
                    {date.getDate()}
                    {hasPlans && <div style={{ width: '3px', height: '3px', backgroundColor: isSel ? 'white' : '#ea580c', borderRadius: '50%', position: 'absolute', bottom: '4px' }}></div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={s.card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <input style={{...s.input, width:'100%', textAlign:'left'}} placeholder="Title" value={planTitle} onChange={e => setPlanTitle(e.target.value)} />
               <button onClick={addPlan} style={{ backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>ADD PLAN</button>
            </div>
          </div>
          {events[selectedDate.toDateString()]?.map((p, i) => (
            <div key={i} style={{ ...s.card, display: 'flex', justifyContent: 'space-between' }}>
              <span>🏀 {p.title}</span>
              <button onClick={() => deletePlan(selectedDate.toDateString(), i)} style={{ border: 'none', background: 'none', color: '#cbd5e1' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {page === "shooting" && (
        <div>
          <div style={{ ...s.card, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color:'#94a3b8' }}>OVERALL FG%</h3>
            <div style={{ height: '140px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={45} outerRadius={60} paddingAngle={5} dataKey="value" startAngle={90} endAngle={450}>
                    <Cell fill="#ea580c" cornerRadius={10} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ea580c' }}>{latest.fgPercent}%</div>
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <div style={s.row}><span>3PTS</span><div><input style={s.input} placeholder="M" value={m3} onChange={e=>setM3(e.target.value)}/> / <input style={s.input} placeholder="A" value={a3} onChange={e=>setA3(e.target.value)}/></div></div>
              <div style={s.row}><span>MID</span><div><input style={s.input} placeholder="M" value={mMid} onChange={e=>setMMid(e.target.value)}/> / <input style={s.input} placeholder="A" value={aMid} onChange={e=>setAMid(e.target.value)}/></div></div>
              <div style={s.row}><span>LAYUP</span><div><input style={s.input} placeholder="M" value={mLay} onChange={e=>setMLay(e.target.value)}/> / <input style={s.input} placeholder="A" value={aLay} onChange={e=>setALay(e.target.value)}/></div></div>
              <div style={{...s.row, borderTop:'1px solid #eee', paddingTop:'8px', marginTop:'8px'}}><span>FREE THROW</span><div><input style={s.input} placeholder="M" value={mFt} onChange={e=>setMFt(e.target.value)}/> / <input style={s.input} placeholder="A" value={aFt} onChange={e=>setAFt(e.target.value)}/></div></div>
              <button onClick={addShotSession} style={{ width:'100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', fontWeight: 'bold', marginTop: '10px' }}>SAVE SESSION</button>
            </div>
          </div>
          
          <div style={{maxHeight:'200px', overflowY:'auto'}}>
            {shotSessions.map(s_i => (
              <div key={s_i.id} style={{...s.card, fontSize:'0.8rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', marginBottom:'5px'}}>
                  <span>{s_i.date}</span>
                  <span style={{color:'#ea580c'}}>FG: {s_i.fgPercent}% | FT: {s_i.ftPercent}%</span>
                  <button onClick={()=>deleteShot(s_i.id)} style={{border:'none', background:'none', color:'#fee2e2'}}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "notes" && (
        <div>
          <textarea style={{ width: '100%', height: '60vh', borderRadius: '20px', padding: '15px', border: '1px solid #e2e8f0', outline: 'none' }} value={tempNotes} onChange={e => setTempNotes(e.target.value)} />
          <button style={{ width: '100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', marginTop: '10px' }} onClick={saveNotesManually}>{isSaved ? "✅ SAVED!" : "💾 SAVE NOTES"}</button>
        </div>
      )}
    </div>
  );
}

import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<BasketballPlanner />);
