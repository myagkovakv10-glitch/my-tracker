import { useState } from "react";
import Tracker from "./Tracker.jsx";
import Habits from "./Habits.jsx";

export default function App() {
  const [tab, setTab] = useState("tasks");
  return (
    <div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0E0E12", borderTop: "1.5px solid #1E1E25", display: "flex", zIndex: 100 }}>
        {[["tasks","✅","Задачи"],["habits","🌿","Привычки"]].map(([key,ic,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20 }}>{ic}</span>
            <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", color: tab===key?(key==="habits"?"#A78BFA":"#44BB77"):"#444", textTransform: "uppercase" }}>{label}</span>
            {tab===key && <div style={{ width: 20, height: 2, borderRadius: 1, background: key==="habits"?"#A78BFA":"#44BB77" }} />}
          </button>
        ))}
      </div>
      {tab === "tasks" ? <Tracker /> : <Habits />}
    </div>
  );
}
