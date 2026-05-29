import { useState, useEffect, useRef } from "react";

const PRIORITIES = [
  { label: "🔴 Срочно", value: "urgent", color: "#FF4444" },
  { label: "🟡 Важно", value: "important", color: "#FFB800" },
  { label: "🟢 Обычное", value: "normal", color: "#44BB77" },
];

const CATEGORIES = [
  { label: "💼 Работа", value: "work", color: "#6C8EF5" },
  { label: "🏠 Личное", value: "personal", color: "#F56C9A" },
  { label: "📚 Учёба", value: "study", color: "#F5A623" },
  { label: "🏃 Здоровье", value: "health", color: "#44BB77" },
  { label: "✨ Другое", value: "other", color: "#A78BFA" },
];

const PRAISE = [
  "Огонь! Так держать! 🔥",
  "Ты машина! 💪",
  "Молодец! Ещё одно дело с плеч!",
  "Красавчик! Продолжай в том же духе! ⭐",
  "Выполнено! Ты справляешься! 🎯",
  "Супер! Ещё шаг к цели! 🚀",
  "Отлично! Гордись собой! 🏆",
];

const STORAGE_KEY = "tasks-v3";
let _nextId = Date.now();
function uid() { return ++_nextId; }
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

export default function Tracker() {
  const [tasks, setTasks] = useState(loadTasks);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("important");
  const [category, setCategory] = useState("work");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [praise, setPraise] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const praiseTimer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  useEffect(() => {
    if (!notifEnabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      tasks.filter(t => !t.done && t.deadline).forEach(t => {
        const diff = (new Date(t.deadline) - now) / 60000;
        if (diff > 0 && diff <= 60) new Notification("⏰ Дедлайн через час!", { body: t.text });
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks, notifEnabled]);

  function enableNotifications() {
    if (!("Notification" in window)) return alert("Браузер не поддерживает уведомления");
    Notification.requestPermission().then(p => { if (p === "granted") setNotifEnabled(true); });
  }

  function addTask() {
    if (!input.trim()) return;
    setTasks(prev => [{ id: uid(), text: input.trim(), priority, category, deadline, done: false, createdAt: Date.now() }, ...prev]);
    setInput(""); setAdding(false); setDeadline("");
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (!t.done) {
        const msg = PRAISE[Math.floor(Math.random() * PRAISE.length)];
        setPraise(msg);
        clearTimeout(praiseTimer.current);
        praiseTimer.current = setTimeout(() => setPraise(null), 3000);
      }
      return { ...t, done: !t.done };
    }));
  }

  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function clearDone() { setTasks(prev => prev.filter(t => !t.done)); }

  const order = { urgent: 0, important: 1, normal: 2 };
  const filtered = tasks
    .filter(t => catFilter === "all" ? true : t.category === catFilter)
    .filter(t => filter === "done" ? t.done : filter === "active" ? !t.done : true)
    .sort((a, b) => (!a.done && b.done ? -1 : a.done && !b.done ? 1 : order[a.priority] - order[b.priority]));

  const doneCount = tasks.filter(t => t.done).length;
  const pi = PRIORITIES.reduce((a, p) => { a[p.value] = p; return a; }, {});
  const ci = CATEGORIES.reduce((a, c) => { a[c.value] = c; return a; }, {});

  const catStats = CATEGORIES.map(c => {
    const all = tasks.filter(t => t.category === c.value);
    return { ...c, total: all.length, done: all.filter(t => t.done).length };
  }).filter(c => c.total > 0);

  function deadlineLabel(dl) {
    if (!dl) return null;
    const diff = (new Date(dl) - new Date()) / 86400000;
    if (diff < 0) return { text: "Просрочено!", color: "#FF4444" };
    if (diff < 1) return { text: "Сегодня!", color: "#FFB800" };
    if (diff < 2) return { text: "Завтра", color: "#F5A623" };
    return { text: `${Math.ceil(diff)} дн.`, color: "#888" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0E0E12", fontFamily: "Georgia,serif", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 580, padding: "36px 16px 80px" }}>

        {praise && (
          <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "#1E1E25", border: "1.5px solid #44BB77", borderRadius: 12, padding: "12px 24px", color: "#44BB77", fontSize: 15, zIndex: 999, boxShadow: "0 8px 32px #0008", whiteSpace: "nowrap" }}>
            {praise}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6, fontFamily: "monospace" }}>Мои задачи</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 400, color: "#F0EEE8" }}>Трекер дел</h1>
            <button onClick={enableNotifications} style={{ background: notifEnabled ? "#44BB7722" : "transparent", border: `1.5px solid ${notifEnabled ? "#44BB77" : "#2A2A35"}`, borderRadius: 8, padding: "6px 10px", color: notifEnabled ? "#44BB77" : "#555", cursor: "pointer", fontSize: 18 }}>🔔</button>
          </div>
          {tasks.length > 0 && (
            <>
              <div style={{ marginTop: 8, fontSize: 13, color: "#666", fontFamily: "monospace" }}>{doneCount} / {tasks.length} выполнено · {Math.round((doneCount / tasks.length) * 100)}%</div>
              <div style={{ marginTop: 6, height: 4, background: "#1E1E25", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(doneCount / tasks.length) * 100}%`, background: "linear-gradient(90deg,#44BB77,#88DDAA)", borderRadius: 2, transition: "width .4s" }} />
              </div>
            </>
          )}
        </div>

        {catStats.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {catStats.map(c => (
              <div key={c.value} style={{ background: "#16161C", border: `1.5px solid ${c.color}33`, borderRadius: 10, padding: "8px 12px", minWidth: 90 }}>
                <div style={{ fontSize: 11, color: c.color, fontFamily: "monospace", marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>{c.done}/{c.total} · {Math.round((c.done/c.total)*100)}%</div>
                <div style={{ marginTop: 4, height: 3, background: "#2A2A35", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${(c.done/c.total)*100}%`, background: c.color, borderRadius: 2, transition: "width .4s" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!adding ? (
          <button onClick={() => setAdding(true)} style={{ width: "100%", padding: "13px 20px", background: "transparent", border: "1.5px dashed #2A2A35", borderRadius: 10, color: "#555", fontSize: 15, cursor: "pointer", textAlign: "left", marginBottom: 24, fontFamily: "inherit" }}>+ Добавить задачу</button>
        ) : (
          <div style={{ background: "#16161C", border: "1.5px solid #2A2A35", borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <input autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setAdding(false); setInput(""); }}} placeholder="Что нужно сделать?" style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#F0EEE8", fontSize: 16, fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }} />
            <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 6 }}>ПРИОРИТЕТ</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {PRIORITIES.map(p => <button key={p.value} onClick={() => setPriority(p.value)} style={{ padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${priority === p.value ? p.color : "#2A2A35"}`, background: priority === p.value ? p.color + "22" : "transparent", color: priority === p.value ? p.color : "#555", fontSize: 12, cursor: "pointer" }}>{p.label}</button>)}
            </div>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 6 }}>КАТЕГОРИЯ</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {CATEGORIES.map(c => <button key={c.value} onClick={() => setCategory(c.value)} style={{ padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${category === c.value ? c.color : "#2A2A35"}`, background: category === c.value ? c.color + "22" : "transparent", color: category === c.value ? c.color : "#555", fontSize: 12, cursor: "pointer" }}>{c.label}</button>)}
            </div>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 6 }}>ДЕДЛАЙН (необязательно)</div>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ background: "#0E0E12", border: "1.5px solid #2A2A35", borderRadius: 7, padding: "6px 10px", color: "#888", fontSize: 13, fontFamily: "monospace", marginBottom: 12, outline: "none", colorScheme: "dark" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addTask} style={{ padding: "8px 20px", background: "#F0EEE8", border: "none", borderRadius: 7, color: "#0E0E12", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Добавить</button>
              <button onClick={() => { setAdding(false); setInput(""); setDeadline(""); }} style={{ padding: "8px 16px", background: "transparent", border: "1.5px solid #2A2A35", borderRadius: 7, color: "#555", fontSize: 14, cursor: "pointer" }}>Отмена</button>
            </div>
          </div>
        )}

        {tasks.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {[["all","Все"],["active","Активные"],["done","Выполненные"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${filter===v?"#F0EEE8":"#2A2A35"}`, background: filter===v?"#F0EEE822":"transparent", color: filter===v?"#F0EEE8":"#555", fontSize: 12, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
        )}
        {tasks.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            <button onClick={() => setCatFilter("all")} style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${catFilter==="all"?"#F0EEE8":"#2A2A35"}`, background: catFilter==="all"?"#F0EEE822":"transparent", color: catFilter==="all"?"#F0EEE8":"#555", fontSize: 12, cursor: "pointer" }}>Все категории</button>
            {CATEGORIES.map(c => tasks.some(t => t.category === c.value) && (
              <button key={c.value} onClick={() => setCatFilter(c.value)} style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${catFilter===c.value?c.color:"#2A2A35"}`, background: catFilter===c.value?c.color+"22":"transparent", color: catFilter===c.value?c.color:"#555", fontSize: 12, cursor: "pointer" }}>{c.label}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: "#333", fontSize: 14, fontFamily: "monospace" }}>{filter==="done"?"Пока ничего не выполнено":filter==="active"?"Всё выполнено 🎉":"Список пуст"}</div>}
          {filtered.map(task => {
            const dl = deadlineLabel(task.deadline);
            const cat = ci[task.category] || ci["other"];
            return (
              <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: task.done?"#111114":"#16161C", border: `1.5px solid ${task.done?"#1A1A1F":"#222228"}`, borderLeft: `3px solid ${task.done?"#222":pi[task.priority].color}`, borderRadius: 10, opacity: task.done?0.5:1 }}>
                <button onClick={() => toggleDone(task.id)} style={{ width: 22, height: 22, minWidth: 22, borderRadius: "50%", border: `2px solid ${task.done?"#44BB77":pi[task.priority].color}`, background: task.done?"#44BB77":"transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 }}>
                  {task.done && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: task.done?"#444":"#D8D6CF", fontSize: 15, textDecoration: task.done?"line-through":"none", wordBreak: "break-word", lineHeight: 1.4 }}>{task.text}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: cat.color, fontFamily: "monospace" }}>{cat.label}</span>
                    <span style={{ fontSize: 11, color: "#3A3A44", fontFamily: "monospace" }}>{pi[task.priority].label}</span>
                    {dl && <span style={{ fontSize: 11, color: dl.color, fontFamily: "monospace" }}>📅 {dl.text}</span>}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} style={{ background: "transparent", border: "none", color: "#333", cursor: "pointer", fontSize: 18, flexShrink: 0, paddingTop: 2 }}>×</button>
              </div>
            );
          })}
        </div>

        {doneCount > 0 && <button onClick={clearDone} style={{ marginTop: 20, padding: "8px 16px", background: "transparent", border: "1.5px solid #2A2A35", borderRadius: 7, color: "#444", fontSize: 12, cursor: "pointer" }}>Удалить выполненные ({doneCount})</button>}
      </div>
    </div>
  );
}
