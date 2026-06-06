import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const activeUrgent = [
  "Apply for Fiktionsbescheinigung at Frankfurt Ausländerbehörde (Rödelbergweg) — on current Bad Vilbel address, before visa expires 9 Oct 2026. Bring: passport, visa, enrollment proof, biometric photo, fee, insurance, housing search evidence.",
  "Find accommodation in Frankfurt city (Stadtgebiet, max ~€400 warm, from 1 July). Kleinanzeigen WG lead deleted 5 June — keep searching.",
  "Pay Goethe semester fee €408.28 by 31 July 2026 (Rückmeldung WiSe 2026/27). IBAN DE18 5005 0000 0001 006535, BIC HELADEF1, ref = Matrikelnummer.",
  "After signing Frankfurt lease → Anmeldung at Frankfurt Bürgeramt within 14 days.",
  "Apply for 3-year residence permit at Frankfurt Ausländerbehörde (needs Anmeldung + enrollment + financial means + insurance).",
  "Reply to Katharina Forster — Green Tea with P: German or English? forster@nachhaltigkeit.uni-frankfurt.de",
  "Confirm Jam Session + send performance details to Faustino. Tue 1 July 2026, 18:00–22:00. faustino@hochschulsport.uni-frankfurt.de",
  "Close the Commerzbank bank account.",
  "Complete Bhavin's task.",
];

const activeImportant = [
  "Reply to Prof. Jattana about HiWi contract extension. jattana@em.uni-frankfurt.de",
  "Activate Goethe-Campus applicant account and check next steps. goethe-campus.uni-frankfurt.de",
  "Attend ENTER_ZUKUNFT_WIWI job fair — Thu 11 June 2026, Hörsaalzentrum, Campus Westend.",
  "Pass all the fundamental exams with flying colours.",
  "Apply for backup universities in Germany (low/no-fee, public, English-taught).",
  "Apply for research assistant roles at Goethe; follow up Prof. Storz (kiradjieva@em.uni-frankfurt.de).",
  "Apply for full-time permanent jobs in German IT companies.",
  "Get B1 German certificate by 16 August 2026.",
  "Aim for 1.0 in first semester — study Economics daily.",
  "Mail professors in Austria, Switzerland, Netherlands, UK, Scandinavia for research/job outreach.",
  "Check GROW@Goethe Mentoring OLAT for unread announcements.",
  "Have updated English CV in tabular format ready (jobs + applications).",
];

const activeTodo = [
  "Once you have a full-time IT job, switch to work visa and finish the Master.",
  "Reach 72 kg target weight by 16 August 2026.",
  "Junges Forum Demokratie scholarship — deadline 30 June 2026 (GROW@Goethe OLAT).",
  "Register for International Career Service workshops (TU Darmstadt). icsrm@tu-darmstadt.de",
  "Resend English Theatre request to Mathilde Charras (mathilde.charras@english-theatre.de).",
  "Reply to GStEP photo consent. gstep@uni-frankfurt.de",
  "Dance Night Hawaii — 17 July 2026. hoffmann@hochschulsport.uni-frankfurt.de",
  "Decide on LAUNCH Build Days hackathon. applications@launch-rm.de",
  "Respond to Kleinanzeigen buyers for birthday-decoration listings.",
];

const completed = [
  { text: "Build a personal website to track tasks and life", priority: "important" },
  { text: "Inform Goethe Global Office about not going to Rotterdam for Erasmus", priority: "urgent" },
  { text: "Reply to professor about the student assistant position", priority: "important" },
  { text: "Send mail to English Theatre for tickets and timesheet", priority: "todo" },
  { text: "Compare salary with the contract and report discrepancies", priority: "important" },
  { text: "Follow up with Ramya about her work and the meeting time", priority: "todo" },
  { text: "Watch the English Theatre shows and make notes", priority: "todo" },
  { text: "Buy onion, eggs and potato", priority: "todo" },
  { text: "Buy sunscreen, facewash, night cream and soap", priority: "todo" },
  { text: "Go to FUAS and attend the welcome week", priority: "todo" },
  { text: "Get tickets for the English Theatre", priority: "todo" },
  { text: "Transfer money to Jemmy and Hasnain", priority: "todo" },
  { text: "Transfer insurance amount to the provider", priority: "important" },
  { text: "Ask Lucas about HiWi contract extension and mail professors for HiWi job", priority: "important" },
  { text: "Send mail to Lucas and Prof. Jattana", priority: "important" },
];

const rows = [
  ...activeUrgent.map((text) => ({ text, status: "active", priority: "urgent", completed_at: null })),
  ...activeImportant.map((text) => ({ text, status: "active", priority: "important", completed_at: null })),
  ...activeTodo.map((text) => ({ text, status: "active", priority: "todo", completed_at: null })),
  ...completed.map(({ text, priority }) => ({
    text,
    status: "done",
    priority,
    completed_at: new Date().toISOString(),
  })),
];

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

console.log(`Done. Inserted ${data.length} tasks (${rows.filter((r) => r.status === "active").length} active, ${rows.filter((r) => r.status === "done").length} completed).`);
