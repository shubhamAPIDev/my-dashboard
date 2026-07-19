// Backup every task from Supabase to backups/tasks-latest.json.
// Running this also counts as DB activity, which keeps a free-tier Supabase
// project from auto-pausing after ~7 days idle. Run daily via GitHub Actions.
//
// Local run:  node --env-file=.env.local scripts/backup-tasks.mjs
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from("tasks")
  .select("*")
  .order("created_at", { ascending: true });

if (error) {
  console.error("Backup failed:", error.message);
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "backups");
mkdirSync(outDir, { recursive: true });

const snapshot = {
  exported_at: new Date().toISOString(),
  count: data.length,
  tasks: data,
};

writeFileSync(resolve(outDir, "tasks-latest.json"), JSON.stringify(snapshot, null, 2) + "\n");

const active = data.filter((t) => t.status !== "done" && t.status !== "missed").length;
console.log(`Backed up ${data.length} tasks (active ${active}) to backups/tasks-latest.json`);
