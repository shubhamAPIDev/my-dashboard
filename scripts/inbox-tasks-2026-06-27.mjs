// One-off: add actionable tasks found by scanning Gmail inbox + sent mail
// (27 Jun 2026) that were missing from the dashboard. Does NOT touch existing tasks.
// Run: node --env-file=.env.local scripts/inbox-tasks-2026-06-27.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabase = createClient(url, key);

const NEW_TASKS = [
  // ── URGENT ──
  {
    text: "Follow up on safe-housing support: reply to Aidshilfe Frankfurt (oliver.koenig@ah-frankfurt.de / roxana.kolb@ah-frankfurt.de) and AmkA, keep the Queer-Referat thread going (queerreferatfrankfurt@posteo.de), and contact the Goethe University Antidiskriminierungsstelle that AmkA recommended (uni-frankfurt.de/88047870/Antidiskriminierung).",
    priority: "urgent",
  },
  // ── IMPORTANT ──
  {
    text: "Inform Erasmus School of Economics Rotterdam that you are withdrawing from the autumn 2026 ERASMUS exchange, and CC Ms Voigtländer (voigtlaender@wiwi.uni-frankfurt.de) — she asked you to do this on 8 June.",
    priority: "important",
  },
  // ── TO-DO ──
  {
    text: "Follow up with Helge Kminek (AAU Klagenfurt) about the research tasks he offered on 17 April — confirm the details and timeline if you still want to take them on. Helge.Kminek@aau.at",
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
if (error) { console.error("Insert failed:", error.message); process.exit(1); }

const byPriority = data.reduce((acc, r) => { acc[r.priority] = (acc[r.priority] || 0) + 1; return acc; }, {});
console.log(`Done. Inserted ${data.length} tasks:`, byPriority);
