"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PROFILE, MANIFESTATION, QUOTES, VISION, PHOTOS } from "../lib/content";
import {
  dueBadgeMeta,
  sortByDue,
  linkifyNotes,
  isFocusTask,
  CATEGORY_LABELS,
} from "../lib/task-utils.jsx";

const LEVELS = [
  { key: "urgent", label: "Urgent", blurb: "do now" },
  { key: "important", label: "Important", blurb: "matters a lot" },
  { key: "todo", label: "To-do", blurb: "someday" },
];

function DueBadge({ dueDate }) {
  const meta = dueBadgeMeta(dueDate);
  if (!meta) return null;
  return (
    <span className={`due-badge ${meta.tone}`} title={meta.diff < 0 ? "Overdue" : `${meta.diff} days left`}>
      {meta.label}
    </span>
  );
}

function TaskRow({ task, onToggle, onPriority, onDelete, showStep }) {
  const [open, setOpen] = useState(false);
  const hasNotes = Boolean(task.notes);
  const isDone = task.status === "done";

  return (
    <div className={`task ${task.priority || "todo"}${isDone ? " is-done" : ""}`}>
      <div className={`checkbox${isDone ? " checked" : ""}`} onClick={() => onToggle(task)} />
      <div className="task-body">
        <div className="task-top">
          {showStep && task.step_order && (
            <span className="step-badge">Step {task.step_order}</span>
          )}
          {task.category && !isDone && (
            <span className={`cat-chip ${task.category}`}>{CATEGORY_LABELS[task.category] || task.category}</span>
          )}
          <span className={`task-title${isDone ? " done" : ""}`}>{task.text}</span>
          {!isDone && task.due_date && <DueBadge dueDate={task.due_date} />}
        </div>
        {hasNotes && (
          <>
            {!isDone && (
              <button type="button" className="notes-toggle" onClick={() => setOpen(!open)}>
                {open ? "Hide details" : "Show details"}
              </button>
            )}
            {(open || isDone) && <p className="task-notes">{linkifyNotes(task.notes)}</p>}
          </>
        )}
      </div>
      {!isDone && (
        <div className="task-actions">
          <button className="flag" title="Change priority" onClick={() => onPriority(task)}>
            &#8645;
          </button>
          <button className="del" title="Delete" onClick={() => onDelete(task)}>
            &#10005;
          </button>
        </div>
      )}
      {isDone && (
        <>
          <span className="task-meta">{fmt(task.completed_at)}</span>
          <button className="del" onClick={() => onDelete(task)}>
            &#10005;
          </button>
        </>
      )}
    </div>
  );
}

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function cyclePriority(p) {
  const order = ["urgent", "important", "todo"];
  return order[(order.indexOf(p) + 1) % order.length];
}

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("urgent");
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [now, setNow] = useState({ date: "", time: "" });

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

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setTasks(data);
    setLoading(false);
  }

  async function addTask() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const { data, error } = await supabase
      .from("tasks")
      .insert({ text, status: "active", priority })
      .select()
      .single();
    if (!error && data) setTasks((t) => [...t, data]);
  }

  async function toggleTask(task) {
    const nowDone = task.status !== "done";
    const update = {
      status: nowDone ? "done" : "active",
      completed_at: nowDone ? new Date().toISOString() : null,
    };
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, ...update } : x)));
    await supabase.from("tasks").update(update).eq("id", task.id);
  }

  async function changePriority(task) {
    const level = cyclePriority(task.priority || "todo");
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, priority: level } : x)));
    await supabase.from("tasks").update({ priority: level }).eq("id", task.id);
  }

  async function deleteTask(task) {
    setTasks((t) => t.filter((x) => x.id !== task.id));
    await supabase.from("tasks").delete().eq("id", task.id);
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
          <p className="panel-lead">Scan the focus strip first — then work through the rest.</p>

          {focusTasks.length > 0 && (
            <div className="focus-strip">
              <div className="focus-head">
                <span className="focus-label">Focus · next 14 days</span>
                <span className="focus-count">{focusTasks.length}</span>
              </div>
              <div className="focus-cards">
                {focusTasks.map((task) => (
                  <div key={task.id} className={`focus-card ${task.priority}`}>
                    <DueBadge dueDate={task.due_date} />
                    <span className="focus-title">{task.text}</span>
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
            />
            <button onClick={addTask}>Add</button>
          </div>

          <div className="prio-picker">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                className={`prio-chip ${l.key} ${priority === l.key ? "on" : ""}`}
                onClick={() => setPriority(l.key)}
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

                const visaChain = group.filter((t) => t.category === "visa" && t.step_order);
                const rest = group.filter((t) => !(t.category === "visa" && t.step_order));

                return (
                  <div className="prio-group" key={level.key}>
                    <div className={`group-head ${level.key}`}>
                      <span className="dot" />
                      {level.label}
                      <span className="group-blurb">{level.blurb}</span>
                      <span className="group-count">{group.length}</span>
                    </div>

                    {visaChain.length > 0 && (
                      <div className="visa-chain">
                        <div className="chain-label">Legal path</div>
                        {visaChain.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            showStep
                            onToggle={toggleTask}
                            onPriority={changePriority}
                            onDelete={deleteTask}
                          />
                        ))}
                      </div>
                    )}

                    {rest.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onPriority={changePriority}
                        onDelete={deleteTask}
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
                      onPriority={changePriority}
                      onDelete={deleteTask}
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
