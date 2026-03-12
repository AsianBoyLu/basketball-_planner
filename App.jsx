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
  const [shotSessions, setShotSessions] = useState([]);
  const [shotsTaken, setShotsTaken] = useState("");
  const [shotsMade, setShotsMade] = useState("");
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  // --- Reset Calendar when switching pages ---
  useEffect(() => {
    setSelectedDate(new Date());
    setCurrentMonth(startOfMonth(new Date()));
  }, [page]);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem("ballerMasterDataV3");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
      setEvents(data.events || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballerMasterDataV3", JSON.stringify({ shots: shotSessions, notes, events }));
  }, [shotSessions, notes, events]);

  // --- Logic ---
  const addShot = () => {
    const made = parseFloat(shotsMade);
    const total = parseFloat(shotsTaken);
    if (isNaN(made) || isNaN(total) || total <= 0 || made > total) return alert("Invalid Numbers");
    const session = { id: Date.now(), date: new Date().toLocaleDateString(), taken: total, made, percent: Math.round((made / total) * 100) };
    setShotSessions([session, ...shotSessions]);
    setShotsTaken(""); setShotsMade("");
  };

  const deleteShot = (id) => setShotSessions(shotSessions.filter(s => s.id !== id));
  
  const addPlan = () => {
    const plan = prompt(`Plan for ${selectedDate.toDateString()}:`);
    if (plan) {
      const key = selectedDate.toDateString();
      setEvents({ ...events, [key]: [...(events[key] || []), plan] });
    }
  };

  const deletePlan = (dateKey, index) => {
    const updated = events[dateKey].filter((_, i) => i !== index);
    setEvents({ ...events, [dateKey]: updated });
  };

  // --- Chart Data Logic ---
  const latestSession = shotSessions[0] || { percent: 0 };
  const pieData = [
    { name: "Made", value: latestSession.percent },
    { name: "Missed", value: 100 - latestSession.percent }
  ];

  // --- Styles ---
  const s = {
    container: { maxWidth: '450px', margin: '0 auto', padding: '15px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh', boxSizing: 'border-box' },
    card: { backgroundColor: 'white', padding: '12px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '12px', border: '1px solid #f1f5f9' },
    nav: { display: 'flex', gap: '6px', marginBottom: '15px' },
    btn: (active) => ({ flex: 1, backgroundColor: active ? '#ea580c' : '#f8fafc', color: active ? 'white' : '#64748b', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }),
    input: { flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '60px', outline: 'none' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }
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
            <div style={s.grid}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'short' })}</h3>
              <button onClick={addPlan} style={{ backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '1.2rem', fontWeight: 'bold' }}>+</button>
            </div>
            {(events[selectedDate.toDateString()] || []).map((p, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>🏀 {p}</span>
                <button onClick={() => deletePlan(selectedDate.toDateString(), i)} style={{ border: 'none', background: 'none', color: '#cbd5e1' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "shooting" && (
        <div>
          <div style={{ ...s.card, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color:'#94a3b8' }}>LAST SESSION</h3>
            <div style={{ height: '160px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" startAngle={90} endAngle={450}>
                    <Cell fill="#ea580c" cornerRadius={10} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ea580c' }}>{latestSession.percent}%</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#94a3b8' }}>ACCURACY</div>
              </div>
            </div>
            
            {/* COMPACT INPUT BAR */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', background: '#f8fafc', padding: '8px', borderRadius: '15px' }}>
              <input style={s.input} placeholder="Made" type="number" value={shotsMade} onChange={e => setShotsMade(e.target.value)} />
              <span style={{fontWeight:'bold', color:'#cbd5e1'}}>/</span>
              <input style={s.input} placeholder="Total" type="number" value={shotsTaken} onChange={e => setShotsTaken(e.target.value)} />
              <button onClick={addShot} style={{ backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.8rem' }}>SAVE</button>
            </div>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {shotSessions.map((s_item) => (
              <div key={s_item.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 15px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{s_item.made}/{s_item.taken} <span style={{color:'#ea580c', marginLeft:'10px'}}>{s_item.percent}%</span></div>
                <button onClick={() => deleteShot(s_item.id)} style={{ border: 'none', background: 'none', color: '#fee2e2', fontWeight: 'bold' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "notes" && (
        <textarea
          style={{ width: '100%', height: '65vh', borderRadius: '20px', padding: '15px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '0.95rem', outline: 'none' }}
          placeholder="Game notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      )}
    </div>
  );
}

// Render
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<BasketballPlanner />);
