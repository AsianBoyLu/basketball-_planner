
import { useState } from "react";

export default function App() {
  const [plans, setPlans] = useState([]);
  const [text, setText] = useState("");

  function addPlan() {
    if (!text) return;
    setPlans([...plans, { title: text, done: false }]);
    setText("");
  }

  function togglePlan(index) {
    const updated = [...plans];
    updated[index].done = !updated[index].done;
    setPlans(updated);
  }

  function deletePlan(index) {
    const updated = plans.filter((_, i) => i !== index);
    setPlans(updated);
  }

  return (
    <div style={{fontFamily:"Arial", padding:"30px"}}>
      <h1>🏀 Basketball Planner</h1>

      <div style={{marginBottom:"20px"}}>
        <input
          placeholder="Add training plan"
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <button onClick={addPlan} style={{marginLeft:"10px"}}>
          Add
        </button>
      </div>

      {plans.map((plan, i) => (
        <div key={i} style={{marginBottom:"10px"}}>
          <span
            onClick={()=>togglePlan(i)}
            style={{
              cursor:"pointer",
              textDecoration: plan.done ? "line-through" : "none",
              marginRight:"10px"
            }}
          >
            {plan.title}
          </span>

          <button onClick={()=>deletePlan(i)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
