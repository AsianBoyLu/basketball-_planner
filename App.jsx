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

  const exportData = () =>
