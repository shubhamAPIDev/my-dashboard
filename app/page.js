"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PROFILE, MANIFESTATION, QUOTES, VISION, PHOTOS } from "../lib/content";

const LEVELS = [
  { key: "urgent", label: "Urgent", blurb: "do now" },
  { key: "important", label: "Important", blurb: "matters a lot" },
  { key: "todo", label: "To-do", blurb: "someday" },
];

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("urgent");
  const [loading, setLoading] = useState(true);
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

  async function changePriority(task, level) {
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

  function fmt(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function cyclePriority(p) {
    const order = ["urgent", "important", "todo"];
    return order[(order.indexOf(p) + 1) % order.length];
  }

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="masthead-left">
          <span className="eyebrow">Personal Dashboard</span>
          <h1 className="title">
            Hello, <em>{PROFILE.name}</em>
          </h1>
          <p className="subtitle">{PROFILE.tagline}</p>
        </div>
        <div className="datetime">
          <span className="datestamp">{now.date}</span>
          <span className="timestap">{now.time}</span>
        </div>
      </header>

      <div className="main-split">
        {/* ---------- TO-DO (primary) ---------- */}
        <section className="panel tasks-panel">
          <div className="panel-head">
            <h2 className="panel-title">To-do</h2>
            <span className="count">{active.length} open</span>
          </div>
          <p className="panel-lead">Today&apos;s actions make the vision real. One task at a time.</p>

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
                const group = active.filter((t) => (t.priority || "todo") === level.key);
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
                      <div className={`task ${level.key}`} key={task.id}>
                        <div className="checkbox" onClick={() => toggleTask(task)} />
                        <span className="task-text">{task.text}</span>
                        <button
                          className="flag"
                          title="Change priority"
                          onClick={() => changePriority(task, cyclePriority(task.priority || "todo"))}
                        >
                          &#8645;
                        </button>
                        <button className="del" onClick={() => deleteTask(task)}>
                          &#10005;
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })
            )}

            {done.length > 0 && (
              <>
                <div className="completed-head">Completed &middot; {done.length}</div>
                {done.map((task) => (
                  <div className="task" key={task.id}>
                    <div className="checkbox checked" onClick={() => toggleTask(task)} />
                    <span className="task-text done">{task.text}</span>
                    <span className="task-meta">{fmt(task.completed_at)}</span>
                    <button className="del" onClick={() => deleteTask(task)}>
                      &#10005;
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* ---------- QUOTES (sidebar) ---------- */}
        <aside className="panel quotes-aside">
          <h2 className="panel-title">Believe</h2>
          <p className="aside-lead">Read one before you start. Carry it through the day.</p>
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

      {/* ---------- MANIFESTATION ---------- */}
      <section className="panel manifest-panel">
        <div className="manifest-head">
          <div>
            <h2 className="panel-title">{MANIFESTATION.title}</h2>
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
            <div className="vision-card" key={i}>
              <img src={v.image} alt={v.label} />
              <div className="vision-caption">
                <div className="label">{v.label}</div>
                <p className="affirmation">{v.affirmation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- PHOTOS ---------- */}
      <section className="panel photos-panel-wide">
        <div className="panel-head">
          <h2 className="panel-title">Future memories</h2>
        </div>
        <p className="panel-lead">Pictures of the life you&apos;re creating. Add your own when ready.</p>
        <div className="photo-grid">
          {PHOTOS.map((p, i) => (
            <img src={p} alt={"photo " + (i + 1)} key={i} />
          ))}
        </div>
      </section>

      <footer>Visualize daily &middot; act today &middot; syncs across all your devices</footer>
    </div>
  );
}
