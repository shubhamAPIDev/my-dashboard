const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

export function parseDueDate(str) {
  if (!str) return null;
  const d = new Date(str + "T12:00:00");
  return isNaN(d) ? null : d;
}

export function dueBadgeMeta(dueStr) {
  if (!dueStr) return null;
  const due = parseDueDate(dueStr);
  if (!due) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  const label = due.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (diff < 0) return { label, tone: "overdue", diff };
  if (diff <= 3) return { label, tone: "soon", diff };
  if (diff <= 14) return { label, tone: "upcoming", diff };
  return { label, tone: "later", diff };
}

export function sortByDue(a, b) {
  const da = a.due_date ? parseDueDate(a.due_date) : null;
  const db = b.due_date ? parseDueDate(b.due_date) : null;
  if (da && db) return da - db;
  if (da) return -1;
  if (db) return 1;
  if (a.step_order && b.step_order) return a.step_order - b.step_order;
  return 0;
}

export function linkifyNotes(text) {
  if (!text) return null;
  const parts = [];
  let last = 0;
  let match;

  while ((match = EMAIL_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a key={match.index} href={`mailto:${match[1]}`} className="task-link">
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export function isFocusTask(task) {
  if (task.status === "done" || !task.due_date) return false;
  const meta = dueBadgeMeta(task.due_date);
  if (!meta) return false;
  return meta.diff <= 14;
}

export const CATEGORY_LABELS = {
  visa: "Visa",
  study: "Study",
  job: "Job",
  admin: "Admin",
  personal: "Personal",
};
