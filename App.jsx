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
  const [tempNotes, setTempNotes] = useState(""); // Holds text before saving
  const [isSaved, setIsSaved] = useState(false);
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
    const saved = localStorage.getItem("ballerMasterDataV4");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
      setTempNotes(data.notes || "");
      setEvents(data.events || {});
    }
  }, []);

  // Save Shooting/Calendar automatically, but Notes only on button press
  useEffect(() => {
    const data = { shots: shotSessions, notes: notes, events };
    localStorage.setItem("ballerMasterDataV4", JSON.stringify(data));
  }, [shotSessions, notes, events]);

  // --- Logic ---
  const saveNotesManually = () => {
    setNotes(tempNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide "Saved" message after 2 seconds
  };

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
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
    saveBtn: { width: '100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }
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
               <b style={{fontSize: '0.9
