import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// Built-in Simple Components to prevent errors
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;
const Button = ({ children, onClick, variant = "default", className = "" }) => {
  const base = "px-4 py-2 rounded-lg font-bold transition-all active:scale-95 text-sm ";
  const styles = variant === "default" ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white";
  return <button onClick={onClick} className={base + styles + className}>{children}</button>;
};

const motivations = [
  "Great players are made when nobody is watching.",
  "Every shot you take today is one closer to your dream.",
  "Discipline beats talent when talent doesn't work.",
  "Shooters shoot. Keep going.",
  "Your future self is watching your work today."
];

export default function BasketballPlanner() {
  const [page, setPage] = useState("calendar");
  const [notes, setNotes] = useState("");
  const [shotSessions, setShotSessions] = useState([]);
  const [shotsTaken, setShotsTaken] = useState("");
  const [shotsMade, setShotsMade] = useState("");
  const [motivation] = useState(motivations[Math.floor(Math.random() * motivations.length)]);

  useEffect(() => {
    const saved = localStorage.getItem("ballData");
    if (saved) {
      const data = JSON.parse(saved);
      setShotSessions(data.shots || []);
      setNotes(data.notes || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ballData", JSON.stringify({ shots: shotSessions, notes }));
  }, [shotSessions, notes]);

  const addShot = () => {
    if (!shotsTaken || !shotsMade) return;
    const session = { date: new Date().toLocaleDateString(), taken: Number(shotsTaken), made: Number(shotsMade), percent: (Number(shotsMade) / Number(shotsTaken)) * 100 };
    setShotSessions([session, ...shotSessions]);
    setShotsTaken(""); setShotsMade("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 text-slate-900 dark:text-white font-sans">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-3xl font-black italic text-orange-600">BALLER PRO</h1>
        
        <div className="flex gap-2">
          <Button onClick={() => setPage("calendar")}>📈 Progress</Button>
          <Button onClick={() => setPage("notes")} variant="outline">📝 Notes</Button>
        </div>

        <Card><CardContent className="italic text-center text-sm">"{motivation}"</CardContent></Card>

        {page === "calendar" ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3">
                <h2 className="font-bold">Log Shooting Session</h2>
                <div className="flex gap-2">
                  <input className="w-1/2 p-2 border rounded dark:bg-slate-800" placeholder="Made" type="number" value={shotsMade} onChange={e => setShotsMade(e.target.value)} />
                  <input className="w-1/2 p-2 border rounded dark:bg-slate-800" placeholder="Total" type="number" value={shotsTaken} onChange={e => setShotsTaken(e.target.value)} />
                </div>
                <Button className="w-full" onClick={addShot}>Save Session</Button>
              </CardContent>
            </Card>

            <div className="h-48 w-full">
              <ResponsiveContainer>
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
              <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded-lg border flex justify-between">
                <span className="font-bold">{s.made}/{s.taken}</span>
                <span className="text-orange-600 font-bold">{s.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <textarea 
            className="w-full h-64 p-4 rounded-xl border dark:bg-slate-900"
            placeholder="Training notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<BasketballPlanner />);
