import { useState, useEffect } from "react";

const HABIT_ICONS = ["💧","🏃","📚","🧘","💊","🥗","😴","✍️","🎯","🚫","💪","🌿"];
const DAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const PRAISE = ["Огонь! 🔥","Молодец! ⭐","Так держать! 💪","Супер! 🚀","Красавчик! 🏆"];
const STORAGE_KEY = "habits-v1";
let _nid = Date.now();
function uid() { return ++_nid; }

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }

export default function Habits() {
  const [habits, setHabits] = useState(load);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💧");
  const [praise, setPraise] = useState(null);
  const week = getWeekDates();
  const today = todayStr();

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); } catch {} }, [habits]);

  function addHabit() {
    if (!name.trim()) return;
    setHabits(prev => [...prev, { id: uid(), name: name.trim(), icon, done: {} }]);
    setName(""); setAdding(false);
  }

  function toggle(habitId, date) {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const done = { ...h.done };
      if (done[date]) { delete done[date]; }
      else {
        done[date] = true;
        if (date === today) {
          const msg = PRAISE[Math.floor(Math.random() * PRAISE.length)];
          setPraise(msg);
          setTimeout(() => setPraise(null), 2500);
        }
      }
      return { ...h, done };
    }));
  }

  function deleteHabit(id) { setHabits(prev => prev.filter(h => h.id !== id)); }

  function streak(habit) {
    let count = 0;
    const d = new Date();
    while (true) {
      const s = d.toISOString().slice(0, 10);
      if (!habit.done[s]) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }

  function weekPercent(habit) {
    return Math.round((week.filter(d => habit.done[d]).length / 7) * 100);
  }

  const totalToday = habits.filter(h => h.done[today]).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0E0E12", fontFamily: "Georgia,serif", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 580, padding: "36px 16px 100px" }}>

        {praise && (
          <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "#1E1E25", border: "1.5px solid #A78BFA", borderRadius: 12, padding: "12px 24px", color: "#A78BFA", fontSize: 15, zIndex: 999, boxShadow: "0 8px 32px #0008", whiteSpace: "nowrap" }}>
            {praise}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 6, fontFamily: "monospace" }}>Ежедневно</div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 400, color: "#F0EEE8" }}>Привычки</h1>
          {habits.length > 0 && (
            <>
              <div style={{ marginTop: 8, fontSize: 13, color: "#666", fontFamily: "monospace" }}>Сегодня: {totalToday} / {habits.length} · {Math.round((totalToday/habits.length)*100)}%</div>
              <div style={{ marginTop: 6, height: 4, background: "#1E1E25", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(totalToday/habits.length)*100}%`, background: "linear-gradient(90deg,#A78BFA,#C4B5FD)", borderRadius: 2, transition: "width .4s" }} />
              </div>
            </>
          )}
        </div>

        {habits.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(7, 32px)", gap: 4, marginBottom: 8, paddingRight: 36 }}>
            <div />
            {week.map((d, i) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10,
