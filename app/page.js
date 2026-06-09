"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { PROFILE, MANIFESTATION, QUOTES, VISION, PHOTOS, GOALS, HABITS, COUNTDOWNS, EXAMS } from "../lib/content";
import { dueBadgeMeta, sortByDue, linkifyNotes, isFocusTask } from "../lib/task-utils.jsx";

const PILLARS = [
  {
    key: "stability",
    icon: "🏠",
    label: "Stability",
    question: "Did you take one step toward home, visa, or banking today?",
    color: "#c85a2a",
  },
  {
    key: "career",
    icon: "💼",
    label: "Career",
    question: "Did you apply, email someone, or work on your CV today?",
    color: "#c87820",
  },
  {
    key: "mind",
    icon: "📚",
    label: "Mind & Exams",
    question: "Did you study or practice German for at least 20 minutes?",
    color: "#3a8a58",
  },
];

function DailyWin() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const storageKey = `daily_wins_${todayStr}`;

  const [checked, setChecked] = useState(() => {
    try {
      const val = localStorage.getItem(storageKey);
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {}
  }, [checked, storageKey]);

  function toggle(key) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function getStreak(pillarKey) {
    let streak = 0;
    for (let i = 1; i <= 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      try {
        const val = localStorage.getItem(`daily_wins_${dateStr}`);
        if (val) {
          const data = JSON.parse(val);
          if (data[pillarKey]) { streak++; continue; }
        }
      } catch {}
      break;
    }
    return streak;
  }

  const allDone = PILLARS.every((p) => checked[p.key]);

  return (
    <div className="daily-win panel">
      <div className="daily-win-head">
        <h2 className="panel-title">Today&apos;s wins</h2>
        <p className="daily-win-sub">Three actions. One per pillar. That&apos;s a good day.</p>
      </div>
      <div className="daily-win-pillars">
        {PILLARS.map((pillar) => {
          const isChecked = !!checked[pillar.key];
          const streak = getStreak(pillar.key);
          return (
            <div
              key={pillar.key}
              className={`pillar-card${isChecked ? " checked" : ""}`}
              style={{ "--pillar-color": pillar.color }}
              onClick={() => toggle(pillar.key)}
            >
              <div className="pillar-top">
                <div className="pillar-icon-label">
                  <span className="pillar-icon">{pillar.icon}</span>
                  <span className="pillar-label">{pillar.label}</span>
                </div>
                <div className="pillar-check">{isChecked ? "✓" : ""}</div>
              </div>
              <p className="pillar-question">{pillar.question}</p>
              <div className="pillar-footer">
                <span className="pillar-streak">
                  {isChecked && streak > 0
                    ? `${streak + 1}d streak`
                    : streak > 0
                    ? `${streak}d streak`
                    : "start today"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {allDone && <p className="daily-win-full">Today&apos;s a full win.</p>}
    </div>
  );
}

const LEVELS = [
  { key: "urgent", label: "Urgent", blurb: "do now" },
  { key: "important", label: "Important", blurb: "matters a lot" },
  { key: "todo", label: "To-do", blurb: "someday" },
];

function DueBadge({ dueDate }) {
  const meta = dueBadgeMeta(dueDate);
  if (!meta) return null;
  return <span className={`due-badge ${meta.tone}`}>{meta.label}</span>;
}

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function TaskRow({ task, onToggle, onSetPriority, onDelete, onEdit, onPointerDownHandle, isDragging, isInsertBefore, rowRef }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const isDone = task.status === "done";
  const currentPriority = task.priority || "todo";

  function startEdit() { setDraft(task.text); setEditing(true); }
  function cancelEdit() { setDraft(task.text); setEditing(false); }

  async function saveEdit() {
    const text = draft.trim();
    if (!text) return;
    if (text !== task.text) await onEdit(task, text);
    setEditing(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); }
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <div ref={rowRef} className={`task ${currentPriority}${isDone ? " is-done" : ""}${editing ? " is-editing" : ""}${isDragging ? " is-dragging" : ""}${isInsertBefore ? " insert-before" : ""}`}>
      {!isDone && !editing && (
        <div
          className="drag-handle"
          title="Drag up/down to change priority"
          onPointerDown={(e) => onPointerDownHandle(e, task)}
        >⠿</div>
      )}
      <div className={`checkbox${isDone ? " checked" : ""}`} onClick={() => !editing && onToggle(task)} />
      <div className="task-body">
        {editing ? (
          <div className="task-edit">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} autoFocus rows={3} />
            <div className="edit-actions">
              <button type="button" className="edit-save" onClick={saveEdit}>Save</button>
              <button type="button" className="edit-cancel" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="task-top">
              <span className={`task-text${isDone ? " done" : ""}`}>{linkifyNotes(task.text)}</span>
              {!isDone && task.text.toLowerCase().includes("commerzbank") && task.text.toLowerCase().includes("photot") && (
                <span className="keystone-badge">🔑 Unblocks most</span>
              )}
              {!isDone && task.due_date && <DueBadge dueDate={task.due_date} />}
            </div>
            {!isDone && (
              <div className="task-prio">
                {LEVELS.map((l) => (
                  <button key={l.key} type="button"
                    className={`task-prio-chip ${l.key} ${currentPriority === l.key ? "on" : ""}`}
                    onClick={() => onSetPriority(task, l.key)}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {!editing && (
        <div className="task-actions">
          <button className="edit" title="Edit" onClick={startEdit}>&#9998;</button>
          <button className="del" title="Delete" onClick={() => onDelete(task)}>&#10005;</button>
        </div>
      )}
      {isDone && !editing && <span className="task-meta">{fmt(task.completed_at)}</span>}
    </div>
  );
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function GoalsSection() {
  return (
    <section className="goals-section">
      {GOALS.map((g) => (
        <div key={g.key} className="goal-card">
          <div className="goal-icon" style={{ background: g.accent + "18", color: g.accent }}>{g.icon}</div>
          <div className="goal-body">
            <div className="goal-title">{g.title}</div>
            <div className="goal-why">{g.why}</div>
            <div className="goal-bar-wrap">
              <div className="goal-bar-fill" style={{ width: `${g.progress}%`, background: g.accent }} />
            </div>
            <div className="goal-pct" style={{ color: g.accent }}>{g.progress}% there</div>
          </div>
        </div>
      ))}
    </section>
  );
}

function HabitTracker() {
  const [data, setData] = useState({});
  const todayStr = new Date().toISOString().slice(0, 10);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    const stored = {};
    days.forEach((day) => {
      try {
        const val = localStorage.getItem(`habits_${day}`);
        if (val) stored[day] = JSON.parse(val);
      } catch {}
    });
    setData(stored);
  }, []);

  function toggle(key) {
    setData((prev) => {
      const updated = { ...prev[todayStr], [key]: !prev[todayStr]?.[key] };
      localStorage.setItem(`habits_${todayStr}`, JSON.stringify(updated));
      return { ...prev, [todayStr]: updated };
    });
  }

  const todayDone = HABITS.filter((h) => data[todayStr]?.[h.key]).length;

  return (
    <div className="panel habit-panel">
      <div className="panel-head">
        <h2 className="panel-title">Daily habits</h2>
        <span className="count">{todayDone}/{HABITS.length} today</span>
      </div>
      <p className="panel-lead">Click today's dot to check off. Past days are read-only.</p>
      <div className="habit-table">
        <div className="habit-row habit-header-row">
          <div className="habit-name" />
          {days.map((d) => (
            <div key={d} className={`habit-day-label${d === todayStr ? " is-today" : ""}`}>
              {new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" })}
              {d === todayStr && <span className="today-dot" />}
            </div>
          ))}
        </div>
        {HABITS.map((h) => (
          <div key={h.key} className="habit-row">
            <div className="habit-name">{h.label}</div>
            {days.map((d) => {
              const done = !!data[d]?.[h.key];
              const isToday = d === todayStr;
              return (
                <div
                  key={d}
                  className={`habit-dot${done ? " done" : ""}${isToday ? " clickable" : ""}`}
                  onClick={() => isToday && toggle(h.key)}
                  title={isToday ? (done ? "Mark undone" : "Mark done") : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusCard({ task, onDone }) {
  const [phase, setPhase] = useState("idle"); // idle | counting | go | done
  const [count, setCount] = useState(5);

  function startCountdown() {
    setPhase("counting");
    setCount(5);
    let n = 5;
    const iv = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(iv);
        setPhase("go");
      } else {
        setCount(n);
      }
    }, 1000);
  }

  function reset() { setPhase("idle"); setCount(5); }

  const shortTask = task.text.split(".")[0] + (task.text.includes(".") ? "." : "");

  if (phase === "idle") return (
    <div className="focus-now-card">
      <div className="focus-now-label">Start with this</div>
      <div className="focus-now-task">{shortTask}</div>
      <p className="focus-two-min">You don&apos;t have to finish. Just start for 2 minutes.</p>
      <button className="focus-countdown-btn" onClick={startCountdown}>
        5 — 4 — 3 — 2 — 1 — Go
      </button>
    </div>
  );

  if (phase === "counting") return (
    <div className="focus-now-card focus-counting">
      <div className="focus-now-label">Starting in…</div>
      <div className="focus-count-num">{count}</div>
      <div className="focus-now-task">{shortTask}</div>
    </div>
  );

  if (phase === "go") return (
    <div className="focus-now-card focus-go">
      <div className="focus-go-num">Go.</div>
      <p className="focus-go-msg">Open it. Touch it. Begin. That&apos;s all.</p>
      <div className="focus-go-actions">
        <button className="focus-now-done" onClick={() => { onDone(task); reset(); }}>I did this ✓</button>
        <button className="focus-reset-btn" onClick={reset}>Not yet</button>
      </div>
    </div>
  );

  return null;
}

function WeekAgenda() {
  const [events, setEvents] = useState([]);
  const [addingToDay, setAddingToDay] = useState(null); // "2026-06-07"
  const [draft, setDraft] = useState({ title: "", time: "" });
  const [saving, setSaving] = useState(false);

  // 7-day window starting today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const todayStr = days[0];

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .gte("event_date", days[0])
      .lte("event_date", days[6])
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true, nullsFirst: true })
      .then(({ data }) => { if (data) setEvents(data); });
  }, []);

  async function saveEvent() {
    const title = draft.title.trim();
    if (!title || !addingToDay || saving) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("events")
      .insert({ title, event_date: addingToDay, event_time: draft.time || null })
      .select()
      .single();
    if (!error && data) setEvents((e) => [...e, data]);
    setDraft({ title: "", time: "" });
    setAddingToDay(null);
    setSaving(false);
  }

  async function deleteEvent(id) {
    setEvents((e) => e.filter((x) => x.id !== id));
    await supabase.from("events").delete().eq("id", id);
  }

  function eventsForDay(d) {
    return events.filter((e) => e.event_date === d);
  }

  return (
    <div className="week-agenda panel">
      <div className="week-header">
        <h2 className="panel-title">This week</h2>
        <span className="eyebrow" style={{color:"var(--ink-soft)"}}>
          {new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"})}
        </span>
      </div>
      <div className="week-days">
        {days.map((d) => {
          const isToday = d === todayStr;
          const dayEvents = eventsForDay(d);
          const isAdding = addingToDay === d;
          const label = new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
          const num = new Date(d + "T12:00:00").getDate();
          return (
            <div key={d} className={`week-day${isToday ? " today" : ""}${isAdding ? " is-adding" : ""}`}>
              <div className="week-day-head">
                <span className="week-day-name">{isToday ? "Today" : label}</span>
                <span className="week-day-num">{num}</span>
              </div>
              <div className="week-day-events">
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="week-event" title={ev.title}>
                    {ev.event_time && (
                      <span className="week-event-time">
                        {ev.event_time.slice(0, 5)}
                      </span>
                    )}
                    <span className="week-event-title">{ev.title}</span>
                    <button className="week-event-del" onClick={() => deleteEvent(ev.id)}>×</button>
                  </div>
                ))}
                {isAdding ? (
                  <div className="week-add-form">
                    <input
                      autoFocus
                      placeholder="What's happening?"
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEvent();
                        if (e.key === "Escape") { setAddingToDay(null); setDraft({ title: "", time: "" }); }
                      }}
                      className="week-add-title"
                    />
                    <input
                      type="time"
                      value={draft.time}
                      onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                      className="week-add-time"
                    />
                    <div className="week-add-actions">
                      <button className="week-add-save" onClick={saveEvent} disabled={saving}>Save</button>
                      <button className="week-add-cancel" onClick={() => { setAddingToDay(null); setDraft({ title: "", time: "" }); }}>×</button>
                    </div>
                  </div>
                ) : (
                  <button className="week-add-btn" onClick={() => setAddingToDay(d)}>+</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExamBlock() {
  const daysToFirst = daysUntil(EXAMS[0].date);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div style={{background:"#fff",border:"1px solid #ede5de",borderTop:"3px solid #d64040",borderRadius:14,padding:"20px 24px 16px",marginBottom:24,boxShadow:"0 4px 16px rgba(30,24,18,0.07)"}}>
      {/* header row */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
          <span style={{fontFamily:"Fraunces, serif",fontSize:48,fontWeight:400,color:"#d64040",lineHeight:1}}>{daysToFirst}</span>
          <span style={{fontSize:12,color:"#9a8880",textTransform:"uppercase",letterSpacing:".07em",paddingBottom:4}}>days to<br/>first exam</span>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#d64040",textTransform:"uppercase",letterSpacing:".08em",marginBottom:2}}>⚠ Visa depends on this</div>
          <div style={{fontSize:11,color:"#9a8880"}}>Pass all 5 to stay in Germany</div>
        </div>
      </div>
      {/* exam list */}
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {EXAMS.map((e, i) => {
          const d = new Date(e.date + "T12:00:00");
          const days = daysUntil(e.date);
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#faf8f5",borderRadius:8,borderLeft:"3px solid #f5c6c6"}}>
              <span style={{fontSize:11,color:"#c8a898",width:20,flexShrink:0,fontWeight:600}}>#{i+1}</span>
              <span style={{fontSize:13,color:"#1e1812",fontWeight:500,flex:1}}>{e.name}</span>
              <span style={{fontSize:11,color:"#9a8880",flexShrink:0}}>
                {dayNames[d.getDay()]}, {d.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
              </span>
              <span style={{background:"#fff0f0",color:"#d64040",fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,flexShrink:0,minWidth:32,textAlign:"center"}}>{days}d</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountdownPanel() {
  return (
    <div className="panel countdown-panel">
      <div className="panel-head">
        <h2 className="panel-title">Key dates</h2>
      </div>
      <div className="countdown-list">
        {COUNTDOWNS.map((c, i) => {
          const days = daysUntil(c.date);
          const isPast = days < 0;
          const isHot = days >= 0 && days <= 7;
          const isSoon = days > 7 && days <= 30;
          const dotColor = isPast ? "#bbb" : isHot ? "#e74c3c" : isSoon ? "#c87820" : "#3a8a58";
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 0",borderBottom: i < COUNTDOWNS.length-1 ? "1px solid var(--border)" : "none"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:42}}>
                <span style={{fontFamily:"var(--font-serif)",fontSize:28,fontWeight:400,color:dotColor,lineHeight:1}}>{isPast ? "—" : days}</span>
                <span style={{fontSize:10,color:"#999",textTransform:"uppercase",letterSpacing:".04em"}}>{isPast ? "past" : "days"}</span>
              </div>
              <div style={{width:3,height:36,borderRadius:2,background:dotColor,flexShrink:0}} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color: isPast ? "#aaa" : "var(--ink)",marginBottom:2,lineHeight:1.3}}>{c.label}</div>
                <div style={{fontSize:11,color:"#999"}}>
                  {new Date(c.date + "T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [celebrationMsg, setCelebrationMsg] = useState(null);
  const [input, setInput] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("todo");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [now, setNow] = useState({ date: "", time: "" });
  const [drag, setDrag] = useState(null);
  const [orderedIds, setOrderedIds] = useState([]);

  // Refs — always current, safe to read in event handlers
  const dragRef = useRef(null);
  const activeRef = useRef([]);
  const orderedIdsRef = useRef([]);
  const groupRefs = useRef({});
  const taskRowRefs = useRef({});
  const setPriorityRef = useRef(null);

  // Load saved task order on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("task_order");
      if (saved) {
        const ids = JSON.parse(saved);
        setOrderedIds(ids);
        orderedIdsRef.current = ids;
      }
    } catch {}
  }, []);

  function saveOrder(ids) {
    orderedIdsRef.current = ids;
    setOrderedIds(ids);
    try { localStorage.setItem("task_order", JSON.stringify(ids)); } catch {}
  }

  // Register pointer handlers once per drag session
  useEffect(() => {
    if (!drag) return;

    function onMove(e) {
      const d = dragRef.current;
      if (!d) return;
      const y = e.clientY;
      const x = e.clientX;

      // Which group is the cursor in?
      let targetLevel = d.targetLevel;
      for (const [key, el] of Object.entries(groupRefs.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (y >= r.top && y <= r.bottom) { targetLevel = key; break; }
      }

      // Which task row should we insert before?
      const orderMap = Object.fromEntries(orderedIdsRef.current.map((id, i) => [id, i]));
      const groupTasks = activeRef.current
        .filter((t) => (t.priority || "todo") === targetLevel && t.id !== d.task.id)
        .sort((a, b) => (orderMap[a.id] ?? 999999) - (orderMap[b.id] ?? 999999));

      let insertBeforeId = null;
      for (const t of groupTasks) {
        const el = taskRowRefs.current[t.id];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (y < r.top + r.height / 2) { insertBeforeId = t.id; break; }
      }

      const next = { ...d, x, y, targetLevel, insertBeforeId };
      dragRef.current = next;
      setDrag(next);
    }

    function onUp() {
      const d = dragRef.current;
      if (!d) { dragRef.current = null; setDrag(null); return; }

      const { task, targetLevel, insertBeforeId } = d;
      const currentActive = activeRef.current;

      // Build new order: remove dragged task, ensure all active tasks tracked
      let newOrder = orderedIdsRef.current.filter((id) => id !== task.id);
      currentActive.forEach((t) => {
        if (t.id !== task.id && !newOrder.includes(t.id)) newOrder.push(t.id);
      });

      // Insert at computed position
      if (insertBeforeId != null && newOrder.includes(insertBeforeId)) {
        newOrder.splice(newOrder.indexOf(insertBeforeId), 0, task.id);
      } else {
        // Append after last task in target group
        const orderMap = Object.fromEntries(newOrder.map((id, i) => [id, i]));
        const groupIds = currentActive
          .filter((t) => (t.priority || "todo") === targetLevel && t.id !== task.id)
          .sort((a, b) => (orderMap[a.id] ?? 999999) - (orderMap[b.id] ?? 999999))
          .map((t) => t.id);
        const lastId = groupIds[groupIds.length - 1];
        if (lastId && newOrder.includes(lastId)) {
          newOrder.splice(newOrder.indexOf(lastId) + 1, 0, task.id);
        } else {
          newOrder.push(task.id);
        }
      }

      saveOrder(newOrder);

      if (targetLevel !== (task.priority || "todo")) {
        setPriorityRef.current?.(task, targetLevel);
      }

      dragRef.current = null;
      setDrag(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag?.task?.id]);

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) console.error("Failed to load tasks:", error.message);
    else if (data) setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    function tick() {
      const current = new Date();
      setNow({
        date: current.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        time: current.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    loadTasks();
    return () => clearInterval(id);
  }, []);

  async function addTask() {
    const text = input.trim();
    if (!text || adding) return;
    setAdding(true);
    setInput("");
    const { data, error } = await supabase
      .from("tasks")
      .insert({ text, status: "active", priority: newTaskPriority })
      .select()
      .single();
    if (error) {
      console.error("Failed to add task:", error.message);
      setInput(text);
    } else if (data) {
      setTasks((t) => [...t, data]);
    }
    setAdding(false);
  }

  async function toggleTask(task) {
    const nowDone = task.status !== "done";
    const update = {
      status: nowDone ? "done" : "active",
      completed_at: nowDone ? new Date().toISOString() : null,
    };
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, ...update } : x)));
    if (nowDone) {
      const msgs = [
        "That's one less thing between you and your future.",
        "Done. Keep that energy.",
        "You showed up. That matters.",
        "One step closer, Shubham.",
        "The version of you that finishes things — that's who you are.",
        "Progress. Real, actual progress.",
      ];
      setCelebrationMsg(msgs[Math.floor(Math.random() * msgs.length)]);
      setTimeout(() => setCelebrationMsg(null), 3000);
    }
    const { error } = await supabase.from("tasks").update(update).eq("id", task.id);
    if (error) {
      console.error("Failed to update task:", error.message);
      setTasks((t) => t.map((x) => (x.id === task.id ? task : x)));
    }
  }

  async function setTaskPriority(task, level) {
    if ((task.priority || "todo") === level) return;
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, priority: level } : x)));
    const { error } = await supabase.from("tasks").update({ priority: level }).eq("id", task.id);
    if (error) {
      console.error("Failed to update priority:", error.message);
      setTasks((t) => t.map((x) => (x.id === task.id ? task : x)));
    }
  }
  setPriorityRef.current = setTaskPriority; // keep ref current for drag handler

  async function deleteTask(task) {
    setTasks((t) => t.filter((x) => x.id !== task.id));
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      console.error("Failed to delete task:", error.message);
      setTasks((t) => [...t, task]);
    }
  }

  async function editTask(task, text) {
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, text } : x)));
    const { error } = await supabase.from("tasks").update({ text }).eq("id", task.id);
    if (error) {
      console.error("Failed to edit task:", error.message);
      setTasks((t) => t.map((x) => (x.id === task.id ? task : x)));
    }
  }

  function startDrag(e, task) {
    e.preventDefault();
    const d = { task, x: e.clientX, y: e.clientY, targetLevel: task.priority || "todo", insertBeforeId: null };
    dragRef.current = d;
    setDrag(d);
  }

  const active = tasks.filter((t) => t.status !== "done");
  activeRef.current = active; // keep ref current

  const done = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  // Sort active tasks by custom drag order; new tasks fall to the end
  const orderMap = Object.fromEntries(orderedIds.map((id, i) => [id, i]));
  const sortedActive = [...active].sort((a, b) => (orderMap[a.id] ?? 999999) - (orderMap[b.id] ?? 999999));

  const focusTasks = sortedActive.filter(isFocusTask).slice(0, 5);

  // Stats calculations
  const todayStr2 = new Date().toISOString().slice(0, 10);
  const doneToday = done.filter(t => t.completed_at?.slice(0, 10) === todayStr2).length;
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6);
  const doneThisWeek = done.filter(t => t.completed_at && new Date(t.completed_at) >= weekAgo).length;
  const doneDays = new Set(done.map(t => t.completed_at?.slice(0, 10)).filter(Boolean));
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (doneDays.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }

  // Dynamic greeting line based on time + progress
  const hour = new Date().getHours();
  const greetingLine = (() => {
    if (doneToday === 0) {
      if (hour < 10) return "You are someone who builds their future. Start with one task.";
      if (hour < 14) return "Every task done today is proof of who you're becoming.";
      if (hour < 19) return "The person you want to be does the hard thing first.";
      return "Even one task tonight means tomorrow starts ahead.";
    }
    if (doneToday === 1) return "You started. That's the hardest part — and you did it.";
    if (doneToday === 2) return "Two wins. You are building momentum that compounds.";
    if (doneToday >= 3 && doneToday < 6) return `${doneToday} done. Identity confirmed: you are someone who shows up.`;
    return `${doneToday} tasks. This is the version of you that wins.`;
  })();

  // Encouragement message in stats
  const streakMsg = streak === 0
    ? "Start today — one task builds a streak."
    : streak === 1 ? "Day 1. Keep this going tomorrow."
    : streak < 7 ? `${streak} days in a row. Don't break the chain.`
    : `${streak} days straight. You're becoming someone different.`;

  // Top focus task — #1 urgent, or #1 important
  const urgentTasks = sortedActive.filter(t => (t.priority || "todo") === "urgent");
  // Focus task: earliest due_date wins; tasks starting with "After" are blocked/conditional — skip them
  const actionableUrgent = urgentTasks.filter(t => !t.text.trim().toLowerCase().startsWith("after"));
  const withDue = actionableUrgent.filter(t => t.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const withoutDue = actionableUrgent.filter(t => !t.due_date);
  const focusTask = withDue[0] || withoutDue[0] || sortedActive.filter(t => (t.priority || "todo") === "important")[0] || null;

  return (
    <div className="wrap" style={drag ? { userSelect: "none" } : undefined}>
      <header className="masthead">
        <div className="masthead-left">
          <span className="eyebrow">Personal Dashboard</span>
          <h1 className="title">
            Hello, <em>{PROFILE.name}</em>
          </h1>
          <p className="masthead-motivation">{greetingLine}</p>
        </div>
        <div className="datetime">
          <span className="datestamp">{now.date}</span>
          <span className="timestap">{now.time}</span>
        </div>
      </header>

      <div className="stats-strip">
        <div className="stat-item">
          <span className="stat-num">{done.length}</span>
          <span className="stat-label">total done</span>
        </div>
        <div className="stat-divider" />
        <div className={`stat-item${doneToday > 0 ? " stat-hot" : ""}`}>
          <span className="stat-num">{doneToday > 0 ? doneToday : "—"}</span>
          <span className="stat-label">today</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">{doneThisWeek}</span>
          <span className="stat-label">this week</span>
        </div>
        <div className="stat-divider" />
        <div className={`stat-item${streak >= 1 ? " stat-hot" : ""}`}>
          <span className="stat-num">{streak > 0 ? `${streak}d` : "—"}</span>
          <span className="stat-label">{streak >= 3 ? "🔥 streak" : "streak"}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item stat-progress">
          <div className="stat-bar-wrap">
            <div className="stat-bar-fill" style={{ width: `${done.length + active.length > 0 ? Math.round(done.length / (done.length + active.length) * 100) : 0}%` }} />
          </div>
          <span className="stat-label">{done.length + active.length > 0 ? Math.round(done.length / (done.length + active.length) * 100) : 0}% complete</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item stat-msg">
          <span className="stat-streak-msg">{streakMsg}</span>
        </div>
      </div>

      <ExamBlock />

      <DailyWin />

      <div className="dashboard-grid">
        <aside className="panel photos-aside">
          <div className="panel-head">
            <h2 className="panel-title">This is me</h2>
          </div>
          <p className="aside-lead">The life I&apos;m building.</p>
          <div className="photos-stack">
            {PHOTOS.map((p, i) => (
              <figure className="photo-frame" key={i}>
                <img src={p.src} alt={p.caption} loading="eager" />
                <figcaption>{p.caption}</figcaption>
              </figure>
            ))}
          </div>

          {focusTask && <FocusCard task={focusTask} onDone={toggleTask} />}
        </aside>

        <section className="panel tasks-panel">
          <div className="panel-head">
            <h2 className="panel-title">To-do</h2>
            <span className="count">{active.length} open</span>
          </div>
          <p className="panel-lead">Each task moves you closer to what you see below.</p>

          {focusTasks.length > 0 && (
            <div className="focus-strip">
              <div className="focus-head">
                <span className="focus-label">Coming up · next 14 days</span>
              </div>
              <div className="focus-cards">
                {focusTasks.map((task) => (
                  <div key={task.id} className={`focus-card ${task.priority}`}>
                    <DueBadge dueDate={task.due_date} />
                    <span className="focus-title">{task.text.split(".")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="composer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="What needs doing?"
              disabled={adding}
            />
            <button onClick={addTask} disabled={adding}>
              {adding ? "…" : "Add"}
            </button>
          </div>

          <div className="prio-picker">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                className={`prio-chip ${l.key} ${newTaskPriority === l.key ? "on" : ""}`}
                onClick={() => setNewTaskPriority(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="task-list">
            {loading ? (
              <p className="loading">Loading your tasks…</p>
            ) : active.length === 0 ? (
              <div className="empty-done">
                <div className="empty-done-icon">✓</div>
                <p className="empty-done-title">All clear, Shubham.</p>
                <p className="empty-done-sub">Every task done. That&apos;s a rare feeling — enjoy it.</p>
              </div>
            ) : (
              LEVELS.map((level) => {
                const group = sortedActive.filter((t) => (t.priority || "todo") === level.key);
                const isTarget = drag?.targetLevel === level.key;
                const isDraggingAny = !!drag;
                const VISIBLE_LIMIT = level.key === "urgent" ? 3 : group.length;
                const expanded = !!expandedGroups[level.key];
                const visibleGroup = expanded ? group : group.slice(0, VISIBLE_LIMIT);
                const hiddenCount = group.length - VISIBLE_LIMIT;
                return (
                  <div
                    key={level.key}
                    ref={(el) => { groupRefs.current[level.key] = el; }}
                    className={`prio-group${isDraggingAny ? " drag-active" : ""}${isTarget ? " drop-over" : ""}`}
                  >
                    <div className={`group-head ${level.key}${isTarget ? " over" : ""}`}>
                      <span className="dot" />
                      {level.label}
                      <span className="group-count">{group.filter(t => t.id !== drag?.task.id).length}</span>
                      {isTarget && drag && drag.task.priority !== level.key && (
                        <span className="drop-hint">→ move here</span>
                      )}
                    </div>
                    {visibleGroup.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onSetPriority={setTaskPriority}
                        onDelete={deleteTask}
                        onEdit={editTask}
                        onPointerDownHandle={startDrag}
                        isDragging={drag?.task.id === task.id}
                        isInsertBefore={drag?.insertBeforeId === task.id}
                        rowRef={(el) => { taskRowRefs.current[task.id] = el; }}
                      />
                    ))}
                    {group.length === 0 && (
                      <div className={`drop-empty-hint${isTarget && drag ? " active" : ""}`}>
                        {isTarget && drag ? `Release to mark ${level.label.toLowerCase()}` : `No ${level.label.toLowerCase()} tasks`}
                      </div>
                    )}
                    {!expanded && hiddenCount > 0 && (
                      <button className="group-show-more" onClick={() => setExpandedGroups(p => ({ ...p, [level.key]: true }))}>
                        + {hiddenCount} more urgent task{hiddenCount > 1 ? "s" : ""} — tap to see all
                      </button>
                    )}
                    {expanded && hiddenCount > 0 && (
                      <button className="group-show-more group-show-less" onClick={() => setExpandedGroups(p => ({ ...p, [level.key]: false }))}>
                        Show fewer
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {done.length > 0 && (
              <div className="completed-block">
                <button
                  type="button"
                  className="completed-toggle"
                  onClick={() => setShowCompleted(!showCompleted)}
                >
                  Completed · {done.length}
                  <span className="chevron">{showCompleted ? "▾" : "▸"}</span>
                </button>
                {showCompleted &&
                  done.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onSetPriority={setTaskPriority}
                      onDelete={deleteTask}
                      onEdit={editTask}
                      onPointerDownHandle={() => {}}
                      isDragging={false}
                    />
                  ))}
              </div>
            )}
          </div>
        </section>

        <aside className="panel quotes-aside">
          <div className="panel-head">
            <h2 className="panel-title">Believe</h2>
          </div>
          <p className="aside-lead">Read one before you start.</p>
          <div className="quotes-stack">
            {QUOTES.map((q, i) => (
              <blockquote className="quote-card" key={i}>
                <p className="quote-text">&ldquo;{q.text}&rdquo;</p>
                <cite className="quote-author">{q.author}</cite>
              </blockquote>
            ))}
          </div>
        </aside>
      </div>

      <WeekAgenda />

      <GoalsSection />

      <div className="middle-row">
        <HabitTracker />
        <CountdownPanel />
      </div>

      <section className="vision-section" id="visualize">
        <div className="vision-section-head">
          <span className="eyebrow">Your future</span>
          <h2 className="vision-section-title">Visualise &amp; manifest</h2>
          <p className="vision-section-sub">Look at these daily. Feel them as already real.</p>
        </div>
        <div className="vision-grid">
          {VISION.map((v, i) => (
            <article className="vision-card" key={i}>
              <div className="vision-img-wrap">
                <img src={v.image} alt={v.label} loading="lazy" />
              </div>
              <div className="vision-body">
                <div className="vision-label">{v.label}</div>
                <p className="vision-affirmation">&ldquo;{v.affirmation}&rdquo;</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>Visualize daily · act today · syncs across all your devices</footer>

      {celebrationMsg && (
        <div className="celebration-toast">
          {celebrationMsg}
        </div>
      )}

      {drag && (
        <div
          className={`drag-preview priority-${drag.targetLevel}`}
          style={{ top: drag.y - 18, left: drag.x - 16 }}
        >
          <span className="drag-preview-label">{LEVELS.find(l => l.key === drag.targetLevel)?.label}</span>
          <span className="drag-preview-text">{drag.task.text.slice(0, 48)}{drag.task.text.length > 48 ? "…" : ""}</span>
        </div>
      )}
    </div>
  );
}
