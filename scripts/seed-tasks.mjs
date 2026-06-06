import { createClient } from "@supabase/supabase-js";
import { TASKS } from "../lib/tasks-data.js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const rows = TASKS.map((t) => ({
  text: t.text,
  notes: t.notes || null,
  due_date: t.due_date || null,
  category: t.category || null,
  step_order: t.step_order || null,
  status: t.status,
  priority: t.priority,
  completed_at: t.status === "done" ? new Date().toISOString() : null,
}));

const { error: deleteError } = await supabase
  .from("tasks")
  .delete()
  .neq("id", "00000000-0000-0000-0000-000000000000");

if (deleteError) {
  console.error("Delete failed:", deleteError.message);
  process.exit(1);
}

const { data, error: insertError } = await supabase.from("tasks").insert(rows).select("id");

if (insertError) {
  console.error("Insert failed:", insertError.message);
  process.exit(1);
}

const active = rows.filter((r) => r.status === "active").length;
const done = rows.filter((r) => r.status === "done").length;
console.log(`Done. Inserted ${data.length} tasks (${active} active, ${done} completed).`);
