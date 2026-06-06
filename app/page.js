"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { PROFILE, MANIFESTATION, QUOTES, VISION, PHOTOS } from "../lib/content";
import { dueBadgeMeta, sortByDue, linkifyNotes, isFocusTask } from "../lib/task-utils.jsx";

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

function TaskRow({ task, onToggle, onSetPriority, onDelete, onEdit, onPointerDownHandle, isDragging }) {
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
    <div className={`task ${currentPriority}${isDone ? " is-done" : ""}${editing ? " is-editing" : ""}${isDragging ? " is-dragging" : ""}`}>
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

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("todo");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [now, setNow] = useState({ date: "", time: "" });
  const [drag, setDrag] = useState(null); // { task, x, y, targetLevel }
  const groupRefs = useRef({});            // level key → DOM element

  // Pointer-based drag — attached to window while dragging
  useEffect(() => {
    if (!drag) return;

    function onMove(e) {
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      let targetLevel = drag.targetLevel;
      for (const [key, el] of Object.entries(groupRefs.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (y >= r.top && y <= r.bottom) { targetLevel = key; break; }
      }
      setDrag((d) => d ? { ...d, x, y, targetLevel } : null);
    }

    function onUp() {
      setDrag((d) => {
        if (d && d.targetLevel !== (d.task.priority || "todo")) {
          setTaskPriority(d.task, d.targetLevel);
        }
        return null;
      });
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
    setDrag({ task, x: e.clientX, y: e.clientY, targetLevel: task.priority || "todo" });
  }

  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  const focusTasks = active.filter(isFocusTask).sort(sortByDue).slice(0, 5);

  return (
    <div className="wrap" style={drag ? { userSelect: "none" } : undefined}>
      <header className="masthead">
        <div className="masthead-left">
          <span className="eyebrow">Personal Dashboard</span>
          <h1 className="title">
            Hello, <em>{PROFILE.name}</em>
          </h1>
        </div>
        <div className="datetime">
          <span className="datestamp">{now.date}</span>
          <span className="timestap">{now.time}</span>
        </div>
      </header>

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
              <p className="empty">Nothing open. Enjoy the quiet, or add something.</p>
            ) : (
              LEVELS.map((level) => {
                const group = active
                  .filter((t) => (t.priority || "todo") === level.key)
                  .sort(sortByDue);
                const isTarget = drag?.targetLevel === level.key;
                const isDraggingAny = !!drag;
                return (
                  <div
                    key={level.key}
                    ref={(el) => { groupRefs.current[level.key] = el; }}
                    className={`prio-group${isDraggingAny ? " drag-active" : ""}${isTarget ? " drop-over" : ""}`}
                  >
                    <div className={`group-head ${level.key}${isTarget ? " over" : ""}`}>
                      <span className="dot" />
                      {level.label}
                      <span className="group-count">{group.length}</span>
                      {isTarget && drag && drag.task.priority !== level.key && (
                        <span className="drop-hint">→ move here</span>
                      )}
                    </div>
                    {group.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onSetPriority={setTaskPriority}
                        onDelete={deleteTask}
                        onEdit={editTask}
                        onPointerDownHandle={startDrag}
                        isDragging={drag?.task.id === task.id}
                      />
                    ))}
                    {group.length === 0 && (
                      <div className={`drop-empty-hint${isTarget && drag ? " active" : ""}`}>
                        {isTarget && drag ? `Release to mark ${level.label.toLowerCase()}` : `No ${level.label.toLowerCase()} tasks`}
                      </div>
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
