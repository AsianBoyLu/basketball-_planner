import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const motivations = [
  "Great players are made when nobody is watching.",
  "Every shot you take today is one closer to your dream.",
  "Discipline beats talent when talent doesn't work.",
  "Shooters shoot. Keep going."
];

export default function BasketballPlanner() {
  const [page, setPage] = useState("calendar");
  const [notes, setNotes] = useState("");
  const [shotSessions, setShotSessions] = useState([]);
  const [shotsTaken, setShotsTaken] = useState("");
  const [shotsMade, setShotsMade] = useState("");
  const [events, setEvents] = useState({}); // For the calendar plans

  // Auto-save data
  useEffect(() => {
    const saved = localStorage.getItem("ballerData");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
      setEvents(data.events || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballerData", JSON.stringify({ shots: shotSessions, notes, events }));
  }, [shotSessions, notes, events]);

  const addShot = () => {
    const made = parseFloat(shotsMade);
    const total = parseFloat(shotsTaken);
    if (!made || !total || made > total) {
      alert("Check your numbers! Made shots can't be more than total.");
      return;
    }
    const session = { 
      date: new Date().toLocaleDateString(), 
      taken: total, 
      made: made, 
      percent: Math.round((made / total) * 100) 
    };
    setShotSessions([session, ...shotSessions]);
    setShotsTaken(""); setShotsMade("");
  };

  const addPlan = () => {
    const plan = prompt("What is the plan for today?");
    if (plan) {
      const today = new Date().toDateString();
      const currentPlans = events[today] || [];
      setEvents({ ...events, [today]: [...currentPlans, plan] });
    }
  };

  // Styles
  const containerStyle = { maxWidth: '500px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' };
  const cardStyle = { backgroundColor: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px' };
  const buttonStyle = { backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' };

  return (
    <div style={containerStyle}>
      <h1 style={{ color: '#ea580c', fontStyle: 'italic', fontWeight: '900', fontSize: '2rem', marginBottom: '5px' }}>BALLER PRO</h1>
      <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '20px' }}>{motivations[0]}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button style={buttonStyle} onClick={() => setPage("calendar")}>📅 Planner</button>
        <button style={buttonStyle} onClick={() => setPage("shooting")}>📈 Shooting</button>
        <button style={{ ...buttonStyle, backgroundColor: '#64748b' }} onClick={() => setPage("notes")}>📝 Notes</button>
      </div>

      {page === "calendar" && (
        <div>
          <div style={cardStyle}>
            <h3>Today's Training</h3>
            <button style={{ ...buttonStyle, width: '100%', marginBottom: '10px' }} onClick={addPlan}>+ Add Workout Plan</button>
            {(events[new Date().toDateString()] || []).map((p, i) => (
              <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>🏀 {p}</div>
            ))}
          </div>
        </div>
      )}

      {page === "shooting" && (
        <div>
          <div style={cardStyle}>
            <h3>Log Shooting</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Made" type="number" value={shotsMade} onChange={e => setShotsMade(e.target.value)} />
              <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Total" type="number" value={shotsTaken} onChange={e => setShotsTaken(e.target.value)} />
            </div>
            <button style={{ ...buttonStyle, width: '100%' }} onClick={addShot}>Save Session</button>
          </div>

          <div style={{ ...cardStyle, height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...shotSessions].reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke="#ea580c" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {shotSessions.map((s, i) => (
            <div key={i} style={cardStyle}>
              <span style={{ fontWeight: 'bold' }}>{s.made}/{s.taken}</span>
              <span style={{ float: 'right', color: '#ea580c', fontWeight: 'bold' }}>{s.percent}% Accuracy</span>
            </div>
          ))}
        </div>
      )}

      {page === "notes" && (
        <textarea 
          style={{ width: '100%', height: '300px', borderRadius: '15px', padding: '15px', border: '1px solid #ddd' }}
          placeholder="Write film notes or game reflections..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      )}
    </div>
  );
}

// Start the app
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<BasketballPlanner />);
