import { useState, useEffect } from "react";

const PRIORITIES = [
  { label: "🔴 Срочно", value: "urgent", color: "#FF4444" },
  { label: "🟡 Важно", value: "important", color: "#FFB800" },
  { label: "🟢 Обычное", value: "normal", color: "#44BB77" },
];

const STORAGE_KEY = "tasks-data-v1";

let _nextId = Date.now();
function uid() { return ++_nextId; }

export default function Tracker() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("important");
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  function addTask() {
    if (!input.trim()) return;
    setTasks(prev => [{ id: uid(), text: input.trim(), priority, done: false, createdAt: Date.now() }, ...prev]);
    setInput("");
    setAdding(false);
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function clearDone() {
    setTasks(prev => prev.filter(t => !t.done));
  }

  const filtered = tasks.filter(t => {
    if (filter === "done") return t.done;
    if (filter === "active") return !t.done;
    return true;
  }).sort((a, b) => {
    const order = { urgent: 0, important: 1, normal: 2 };
    if (!a.done && b.done) return -1;
    if (a.done && !b.done) return 1;
    return order[a.priority] - order[b.priority];
  });

  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const priorityInfo = PRIORITIES.reduce((acc, p) => { acc[p.value] = p; return acc; }, {});

  return (
    <div style={{ minHeight: "100vh", background: "#0E0E12", fontFamily: "'Georgia', serif", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 560, padding: "40px 20px 80px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 8, fontFamily: "monospace" }}>Мои задачи</div>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 400, color: "#F0EEE8", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Трекер дел</h1>
          {totalCount > 0 && <div style={{ marginTop: 10, fontSize: 13, color: "#666", fontFamily: "monospace" }}>{doneCount} / {totalCount} выполнено</div>}
          {totalCount > 0 && (
            <div style={{ marginTop: 8, height: 3, background: "#1E1E25", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(doneCount / totalCount) * 100}%`, background: "linear-gradient(90deg, #44BB77, #88DDAA)", borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          )}
        </div>

        {!adding ? (
          <button onClick={() => setAdding(true)} style={{ width: "100%", padding: "14px 20px", background: "transparent", border: "1.5px dashed #2A2A35", borderRadius: 10, color: "#555", fontSize: 15, cursor: "pointer", textAlign: "left", marginBottom: 28, fontFamily: "inherit" }}>
            + Добавить задачу
          </button>
        ) : (
          <div style={{ background: "#16161C", border: "1.5px solid #2A2A35", borderRadius: 10, padding: "16px", marginBottom: 28 }}>
            <input autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setAdding(false); setInput(""); } }} placeholder="Что нужно сделать?" style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#F0EEE8", fontSize: 16, fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {PRIORITIES.map(p => (
                <button key={p.value} onClick={() => setPriority(p.value)} style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${priority === p.value ? p.color : "#2A2A35"}`, background: priority === p.value ? p.color + "22" : "transparent", color: priority === p.value ? p.color : "#555", fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>{p.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addTask} style={{ padding: "8px 20px", background: "#F0EEE8", border: "none", borderRadius: 7, color: "#0E0E12", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Добавить</button>
              <button onClick={() => { setAdding(false); setInput(""); }} style={{ padding: "8px 16px", background: "transparent", border: "1.5px solid #2A2A35", borderRadius: 7, color: "#555", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Отмена</button>
            </div>
          </div>
        )}

        {totalCount > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {[["all", "Все"], ["active", "Активные"], ["done", "Выполненные"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${filter === val ? "#F0EEE8" : "#2A2A35"}`, background: filter === val ? "#F0EEE822" : "transparent", color: filter === val ? "#F0EEE8" : "#555", fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>{label}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "48px 20px", color: "#333", fontSize: 14, fontFamily: "monospace" }}>{filter === "done" ? "Пока ничего не выполнено" : filter === "active" ? "Всё выполнено 🎉" : "Список пуст — добавь первую задачу"}</div>}
          {filtered.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: task.done ? "#111114" : "#16161C", border: `1.5px solid ${task.done ? "#1A1A1F" : "#222228"}`, borderLeft: `3px solid ${task.done ? "#222" : priorityInfo[task.priority].color}`, borderRadius: 10, opacity: task.done ? 0.5 : 1 }}>
              <button onClick={() => toggleDone(task.id)} style={{ width: 22, height: 22, minWidth: 22, borderRadius: "50%", border: `2px solid ${task.done ? "#44BB77" : priorityInfo[task.priority].color}`, background: task.done ? "#44BB77" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 }}>
                {task.done && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: task.done ? "#444" : "#D8D6CF", fontSize: 15, lineHeight: 1.4, textDecoration: task.done ? "line-through" : "none", wordBreak: "break-word" }}>{task.text}</div>
                <div style={{ fontSize: 11, color: "#3A3A44", fontFamily: "monospace", marginTop: 4 }}>{priorityInfo[task.priority].label}</div>
              </div>
              <button onClick={() => deleteTask(task.id)} style={{ background: "transparent", border: "none", color: "#333", cursor: "pointer", padding: "2px 4px", fontSize: 16, flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>

        {doneCount > 0 && <button onClick={clearDone} style={{ marginTop: 20, padding: "8px 16px", background: "transparent", border: "1.5px solid #2A2A35", borderRadius: 7, color: "#444", fontSize: 12, cursor: "pointer", fontFamily: "monospace", display: "block" }}>Удалить выполненные ({doneCount})</button>}
      </div>
    </div>
  );
}
