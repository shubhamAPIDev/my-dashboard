// One-off: add new actionable tasks found in Gmail (24 Jun 2026) WITHOUT wiping
// existing live tasks. Run: node --env-file=.env.local scripts/inbox-tasks-2026-06-24.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const NEW_TASKS = [
  // ── IMPORTANT ──
  {
    text: "Reply to the MIEEP coordinator to arrange the student-representatives meeting (as in previous semesters) — and gather feedback from fellow students on program topics beforehand to bring to the meeting.",
    priority: "important",
  },
  // ── TO-DO ──
  {
    text: "Vote shares: TATA Motors Ltd shareholder e-voting via CDSL — e-voting opens 25 June 2026, 09:00. Cast your vote before the window closes (AGM follows).",
    due_date: "2026-06-25",
    priority: "todo",
  },
];

const rows = NEW_TASKS.map((t) => ({
  text: t.text,
  notes: null,
  due_date: t.due_date || null,
  category: null,
  step_order: null,
  status: "active",
  priority: t.priority,
  completed_at: null,
}));

const { data, error } = await supabase.from("tasks").insert(rows).select("id, priority");

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

const byPriority = data.reduce((acc, r) => {
  acc[r.priority] = (acc[r.priority] || 0) + 1;
  return acc;
}, {});
console.log(`Done. Inserted ${data.length} tasks:`, byPriority);
