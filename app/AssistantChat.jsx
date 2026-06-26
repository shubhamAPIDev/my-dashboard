"use client";

import { useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "What should I focus on today?",
  "Summarize my overdue tasks",
  "Draft a reply to Prof. Jattana",
];

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", text }
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending, open]);

  async function send(text) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : `⚠ ${data.error || "Something went wrong."}`;
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "⚠ Couldn't reach the assistant." }]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <button
        className={`assistant-fab${open ? " is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        title={open ? "Close assistant" : "Ask your assistant"}
        aria-label="Toggle assistant"
      >
        {open ? "✕" : "✦"}
      </button>

      {open && (
        <div className="assistant-panel">
          <div className="assistant-head">
            <div className="assistant-head-title">
              <span className="assistant-dot" />
              Assistant
            </div>
            <span className="assistant-head-sub">knows your tasks</span>
          </div>

          <div className="assistant-messages" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="assistant-empty">
                <p className="assistant-empty-title">Hi Shubham 👋</p>
                <p className="assistant-empty-sub">
                  Ask me anything, or pick a starter:
                </p>
                <div className="assistant-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="assistant-suggestion" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`assistant-msg ${m.role}`}>
                {m.text.split("\n").map((line, j) => (
                  <p key={j}>{line || " "}</p>
                ))}
              </div>
            ))}
            {sending && (
              <div className="assistant-msg assistant typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
          </div>

          <div className="assistant-composer">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask your assistant…"
              rows={1}
              disabled={sending}
            />
            <button onClick={() => send()} disabled={sending || !input.trim()}>
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
