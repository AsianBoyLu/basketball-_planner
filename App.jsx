import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

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
  const [page, setPage] = useState("calendar");
  const [notes, setNotes] = useState("");
  const [shotSessions, setShotSessions] = useState([]);
  const [shotsTaken, setShotsTaken] = useState("");
  const [shotsMade, setShotsMade] = useState("");
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  // --- Persistence (Saves to your phone) ---
  useEffect(() => {
    const saved = localStorage.getItem("ballerMasterDataFinal");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
      setEvents(data.events || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballerMasterDataFinal", JSON.stringify({ shots: shotSessions, notes, events }));
  }, [shotSessions, notes, events]);

  // --- Logic ---
  const addShot = () => {
    const made = parseFloat(shotsMade);
    const total = parseFloat(shotsTaken);
    if (isNaN(made) || isNaN(total) || total <= 0 || made > total) {
      alert("Please enter valid numbers (Made cannot be more than Total).");
      return;
    }
    const session = { 
      id: Date.now(),
      date: new Date().toLocaleDateString(), 
      taken: total, 
      made: made, 
      percent: Math.round((made / total) * 100) 
    };
    setShotSessions([session, ...shotSessions]);
    setShotsTaken(""); setShotsMade("");
  };

  const deleteShot = (id) => {
    setShotSessions(shotSessions.filter(s => s.id !== id));
  };

  const addPlan = () => {
    const plan = prompt(`New Plan for ${selectedDate.toDateString()}:`);
    if (plan) {
      const key = selectedDate.toDateString();
      setEvents({ ...events, [key]: [...(events[key] || []), plan] });
    }
  };

  const deletePlan = (dateKey, index) => {
    const updated = events[dateKey].filter((_, i) => i !== index);
    setEvents({ ...events, [dateKey]: updated });
  };

  const exportData = () => {
    const data = localStorage.getItem("ballerMasterDataFinal");
    alert("Copy this backup code:\n\n" + data);
  };

  // --- Styles ---
  const s = {
    container: { maxWidth: '500px', margin: '0 auto', padding: '15px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' },
    card: { backgroundColor: 'white', padding: '15px', borderRadius: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '15px' },
    nav: { display: 'flex', gap: '8px', marginBottom: '20px' },
    btn: (active) => ({ flex: 1, backgroundColor: active ? '#ea580c' : 'white', color: active ? 'white' : '#64748b', border: active ? 'none' : '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }),
    smallBtn: { border: 'none', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginTop: '10px' }
  };

  return (
    <div style={s.container}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#ea580c', fontWeight: '900', fontStyle: 'italic', margin: 0, fontSize: '2.2rem' }}>BALLER PRO</h1>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>12-YEAR ELITE TRAINING LOG</div>
      </header>

      <div style={s.nav}>
        <button style={s.btn(page === 'calendar')} onClick={() => setPage("calendar")}>📅 Plan</button>
        <button style={s.btn(page === 'shooting')} onClick={() => setPage("shooting")}>📈 Shots</button>
        <button style={s.btn(page === 'notes')} onClick={() => setPage("notes")}>📝 Notes</button>
      </div>

      {page === "calendar" && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={s.smallBtn} onClick={() => { const d = new Date(currentMonth); d.setFullYear(d.getFullYear() - 1); setCurrentMonth(startOfMonth(d)); }}>«</button>
                <button style={s.smallBtn} onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(startOfMonth(d)); }}>‹</button>
              </div>
              <b style={{ fontSize: '1rem' }}>{currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</b>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={s.smallBtn} onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(startOfMonth(d)); }}>›</button>
                <button style={s.smallBtn} onClick={() => { const d = new Date(currentMonth); d.setFullYear(d.getFullYear() + 1); setCurrentMonth(startOfMonth(d)); }}>»</button>
              </div>
            </div>

            <div style={s.grid}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#cbd5e1' }}>{d}</div>)}
              {buildMonthGrid(currentMonth).map((date, i) => {
                const key = date.toDateString();
                const isSel = key === selectedDate.toDateString();
                const isToday = key === new Date().toDateString();
                const hasPlans = events[key] && events[key].length > 0;
                return (
                  <div key={i} onClick={() => setSelectedDate(date)} style={{
                    height: '45px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer',
                    backgroundColor: isSel ? '#ea580c' : 'transparent', color: isSel ? 'white' : (date.getMonth() !== currentMonth.getMonth() ? '#cbd5e1' : '#1e293b'),
                    border: isToday && !isSel ? '2px solid #ea580c' : 'none', fontWeight: isToday || isSel ? 'bold' : 'normal', position: 'relative'
                  }}>
                    {date.getDate()}
                    {hasPlans && <div style={{ width: '4px', height: '4px', backgroundColor: isSel ? 'white' : '#ea580c', borderRadius: '50%', position: 'absolute', bottom: '5px' }}></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'short' })} Plans</h3>
              <button onClick={addPlan} style={{ backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
            </div>
            {(events[selectedDate.toDateString()] || []).length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Rest day or no plans logged.</p> :
              events[selectedDate.toDateString()].map((p, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                  <span>🏀 {p}</span>
                  <button onClick={() => deletePlan(selectedDate.toDateString(), i)} style={{ border: 'none', background: 'none', color: '#cbd5e1', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {page === "shooting" && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div style={s.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Log Shooting</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} placeholder="Made" type="number" value={shotsMade} onChange={e => setShotsMade(e.target.value)} />
              <input style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} placeholder="Total" type="number" value={shotsTaken} onChange={e => setShotsTaken(e.target.value)} />
            </div>
            <button style={{ width: '100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }} onClick={addShot}>Save Session</button>
          </div>

          {shotSessions.length > 0 && (
            <div style={{ ...s.card, height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...shotSessions].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="percent" stroke="#ea580c" strokeWidth={4} dot={{ fill: '#ea580c', r: 4 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {shotSessions.map((s_item) => (
            <div key={s_item.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => deleteShot(s_item.id)} style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{s_item.made}/{s_item.taken}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>{s_item.date}</div>
                </div>
              </div>
              <div style={{ color: '#ea580c', fontWeight: '900', fontSize: '1.4rem' }}>{s_item.percent}%</div>
            </div>
          ))}
        </div>
      )}

      {page === "notes" && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <textarea
            style={{ width: '100%', height: '60vh', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '1rem', lineHeight: '1.5', marginBottom: '15px' }}
            placeholder="Film study, game notes, or personal goals..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <button onClick={exportData} style={{ width: '100%', background: 'none', border: '1px dashed #cbd5e1', padding: '10px', color: '#94a3b8', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>
            📥 Backup Data (For Transfer)
          </button>
        </div>
      )}
    </div>
  );
}

// Render
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<BasketballPlanner />);
