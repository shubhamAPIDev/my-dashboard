"use client";

import { useEffect, useState } from "react";
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

function TaskRow({ task, onToggle, onSetPriority, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const isDone = task.status === "done";
  const currentPriority = task.priority || "todo";

  function startEdit() {
    setDraft(task.text);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(task.text);
    setEditing(false);
  }

  async function saveEdit() {
    const text = draft.trim();
    if (!text) return;
    if (text !== task.text) await onEdit(task, text);
    setEditing(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <div className={`task ${task.priority || "todo"}${isDone ? " is-done" : ""}${editing ? " is-editing" : ""}`}>
      <div className={`checkbox${isDone ? " checked" : ""}`} onClick={() => !editing && onToggle(task)} />
      <div className="task-body">
        {editing ? (
          <div className="task-edit">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
              rows={3}
            />
            <div className="edit-actions">
              <button type="button" className="edit-save" onClick={saveEdit}>
                Save
              </button>
              <button type="button" className="edit-cancel" onClick={cancelEdit}>
                Cancel
              </button>
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
                  <button
                    key={l.key}
                    type="button"
                    className={`task-prio-chip ${l.key} ${currentPriority === l.key ? "on" : ""}`}
                    onClick={() => onSetPriority(task, l.key)}
                  >
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
          <button className="edit" title="Edit task" onClick={startEdit}>
            &#9998;
          </button>
          <button className="del" title="Delete" onClick={() => onDelete(task)}>
            &#10005;
          </button>
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

  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  const focusTasks = active.filter(isFocusTask).sort(sortByDue).slice(0, 5);

  return (
    <div className="wrap">
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
                if (group.length === 0) return null;
                return (
                  <div className="prio-group" key={level.key}>
                    <div className={`group-head ${level.key}`}>
                      <span className="dot" />
                      {level.label}
                      <span className="group-blurb">{level.blurb}</span>
                      <span className="group-count">{group.length}</span>
                    </div>
                    {group.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onSetPriority={setTaskPriority}
                        onDelete={deleteTask}
                        onEdit={editTask}
                      />
                    ))}
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

      <section className="panel manifest-panel" id="visualize">
        <div className="manifest-head">
          <div className="manifest-copy">
            <span className="manifest-eyebrow">Scroll down · see your future</span>
            <h2 className="manifest-title">{MANIFESTATION.title}</h2>
            <p className="manifest-intro">{MANIFESTATION.intro}</p>
          </div>
          <div className="manifest-steps">
            {MANIFESTATION.steps.map((step, i) => (
              <div className="manifest-step" key={i}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <strong>{step.label}</strong>
                  <span>{step.blurb}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="vision-grid">
          {VISION.map((v, i) => (
            <article className="vision-card" key={i}>
              <img src={v.image} alt={v.label} loading="lazy" />
              <div className="vision-caption">
                <div className="label">{v.label}</div>
                <p className="affirmation">{v.affirmation}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>Visualize daily · act today · syncs across all your devices</footer>
    </div>
  );
}
