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

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem("ballerMasterData");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
      setEvents(data.events || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballerMasterData", JSON.stringify({ shots: shotSessions, notes, events }));
  }, [shotSessions, notes, events]);

  // --- Logic ---
  const addShot = () => {
    const made = parseFloat(shotsMade);
    const total = parseFloat(shotsTaken);
    if (!made || !total || made > total) return alert("Check your numbers!");
    const session = { date: new Date().toLocaleDateString(), taken: total, made, percent: Math.round((made / total) * 100) };
    setShotSessions([session, ...shotSessions]);
    setShotsTaken(""); setShotsMade("");
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
    const data = localStorage.getItem("ballerMasterData");
    alert("Copy this code and save it somewhere safe:\n\n" + data);
  };

  // --- Styles ---
  const s = {
    container: { maxWidth: '500px', margin: '0 auto', padding: '15px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' },
    card: { backgroundColor: 'white', padding: '15px', borderRadius: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '15px' },
    nav: { display: 'flex', gap: '8px', marginBottom: '20px' },
    btn: (active) => ({ flex: 1, backgroundColor: active ? '#ea580c' : 'white', color: active ? 'white' : '#64748b', border: active ? 'none' : '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem' }),
    smallBtn: { border: 'none', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginTop: '10px' }
  };

  return (
    <div style={s.container}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#ea580c', fontWeight: '900', fontStyle: 'italic', margin: 0, fontSize: '2.2rem' }}>BALLER PRO</h1>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>12-YEAR ELITE PLANNER</div>
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
              {buildMonthGrid(currentMonth).
