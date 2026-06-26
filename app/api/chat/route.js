import { createClient } from "@supabase/supabase-js";

// Gemini free-tier chat endpoint. The API key lives only on the server.
// Get a free key (no card) at https://aistudio.google.com/apikey and set
// GEMINI_API_KEY in .env.local (local) and in Vercel project env vars (prod).

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function buildTaskContext(tasks) {
  const active = tasks.filter((t) => t.status !== "done" && t.status !== "missed");
  const missed = tasks.filter((t) => t.status === "missed");
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const fmt = (t) => {
    const due = t.due_date ? ` (due ${t.due_date})` : "";
    return `- [${t.priority || "todo"}]${due} ${t.text}`;
  };

  const byPrio = (p) => active.filter((t) => (t.priority || "todo") === p).map(fmt);

  const lines = [];
  lines.push(`Active tasks: ${active.length} | Completed: ${doneCount} | Missed: ${missed.length}`);
  const urgent = byPrio("urgent");
  const important = byPrio("important");
  const todo = byPrio("todo");
  if (urgent.length) lines.push(`\nURGENT:\n${urgent.join("\n")}`);
  if (important.length) lines.push(`\nIMPORTANT:\n${important.join("\n")}`);
  if (todo.length) lines.push(`\nTO-DO:\n${todo.join("\n")}`);
  if (missed.length) lines.push(`\nMISSED (deadline passed):\n${missed.map(fmt).join("\n")}`);
  return lines.join("\n");
}

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Chat is not configured yet. Add GEMINI_API_KEY to your environment." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message || typeof message !== "string") {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  // Pull the live task list so the assistant is grounded in real data.
  let taskContext = "(task list unavailable)";
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from("tasks")
      .select("text,status,priority,due_date")
      .order("created_at", { ascending: true });
    if (data) taskContext = buildTaskContext(data);
  } catch {
    // fall back to no context rather than failing the chat
  }

  const today = new Date().toISOString().slice(0, 10);
  const systemPrompt = `You are Shubham's personal assistant inside his life dashboard. You are warm, direct, and practical — never preachy. Shubham is an Indian master's student in Frankfurt, Germany, juggling visa/housing, university exams, job hunting, and personal goals.

Today's date is ${today}.

You can see his live task list below. Use it to give grounded, specific help: prioritize, summarize what's overdue, suggest what to do next, draft emails, or break big tasks into steps. Keep answers concise and actionable. If he asks something unrelated to tasks, just help normally.

=== HIS CURRENT TASKS ===
${taskContext}
=== END TASKS ===`;

  // Map prior turns into Gemini's format (roles: "user" / "model").
  const contents = [];
  for (const turn of Array.isArray(history) ? history.slice(-10) : []) {
    if (!turn || !turn.text) continue;
    contents.push({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: String(turn.text) }],
    });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("Gemini error:", res.status, detail);
      return Response.json(
        { error: `AI service error (${res.status}). Check your API key and quota.` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const reply =
      json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "Sorry, I couldn't generate a response. Try rephrasing?";
    return Response.json({ reply });
  } catch (err) {
    console.error("Chat request failed:", err);
    return Response.json({ error: "Could not reach the AI service." }, { status: 502 });
  }
}
