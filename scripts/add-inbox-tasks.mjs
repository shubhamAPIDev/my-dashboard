// One-off: add new tasks identified from Gmail (18 Jun 2026) WITHOUT wiping
// existing live tasks. Run: node --env-file=.env.local scripts/add-inbox-tasks.mjs
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
    text: "Submit Personal Finance block seminar slides (Prof. Hackethal) — merge your group's slides into ONE file (pptx/pdf) and send to Aylin Cam. Deadline was Thu 18 June, 8:00 AM. If not yet sent, email immediately. Schedule is on OLAT.",
    due_date: "2026-06-18",
    priority: "urgent",
  },
  {
    text: "Sign the new HiWi contract at the Quantum Computing group with Beatriz Lopes Abreu — 5-month position offered 15 June. Finalize the in-person signature. lopesabreu@em.uni-frankfurt.de (cc jattana@em.uni-frankfurt.de)",
    priority: "urgent",
  },
  // ── IMPORTANT ──
  {
    text: "Apply for the Goethe Abschlussstipendium (final scholarship for international students) — application deadline 30 June 2026. stipendien@uni-frankfurt.de",
    due_date: "2026-06-30",
    priority: "important",
  },
  // ── TO-DO ──
  {
    text: "Register on the SWFFM student-dorm waiting list — swffm.de/wohnen/wohnheime. Recommended by Sale (ieep) as the first step for Frankfurt housing; waiting list is long, so start now.",
    priority: "todo",
  },
  {
    text: "Vote shares: Infosys & Bank of Baroda shareholder e-voting via CDSL — e-voting window closes 22 June 2026 (AGMs 23 June).",
    due_date: "2026-06-22",
    priority: "todo",
  },
  {
    text: "Café Sprachwelten — language games café. Thu 18 June, 17:00–19:00, Room 14, ISZ Container (Campus Westend, Building 17). No registration; drop in. 3 sessions of ≥45 min → certificate of participation.",
    due_date: "2026-06-18",
    priority: "todo",
  },
  {
    text: "MIEEP / SAFE panel discussion 'Auf dem Weg zur Klimaneutralität – Die Rolle des Finanzsektors' (German). Fri 19 June, 11:00–12:30. Register on the SAFE Frankfurt events site. ieep@wiwi.uni-frankfurt.de",
    due_date: "2026-06-19",
    priority: "todo",
  },
  {
    text: "Mountain Sports Excursion (Hochschulsport) — Kleinwalsertal, Sun 20–Fri 25 Sep 2026 (hikes: Schwarzwasserhütte, Ifen, Breitachklamm). Registration deadline 14 June already passed — email to ask if a late spot is available. info@hochschulsport.uni-frankfurt.de",
    priority: "todo",
  },
  {
    text: "CHE Hochschulranking 2026 — fill out the master's-programme ranking survey (optional). befragung@uni-frankfurt.de",
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
