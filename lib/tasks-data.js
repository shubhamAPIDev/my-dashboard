/** Task list — full descriptive text (Claude chat style), one field per task. */

export const TASKS = [
  // ── URGENT ──
  {
    text: "Apply for Fiktionsbescheinigung at Frankfurt Ausländerbehörde (Rödelbergweg) — on current Bad Vilbel address, before visa expires 9 Oct 2026. Bring: passport, visa, enrollment proof, biometric photo, fee, insurance, housing search evidence.",
    due_date: "2026-10-09",
    priority: "urgent",
    status: "active",
  },
  {
    text: "Find accommodation in Frankfurt city (Stadtgebiet, max ~€400 warm, from 1 July). Kleinanzeigen WG lead deleted 5 June — keep searching.",
    due_date: "2026-07-01",
    priority: "urgent",
    status: "active",
  },
  {
    text: "Pay Goethe semester fee €408.28 by 31 July 2026 (Rückmeldung WiSe 2026/27). IBAN DE18 5005 0000 0001 006535, BIC HELADEF1, ref = Matrikelnummer. Late fee €30 after 31 Jul; auto de-registration if missed.",
    due_date: "2026-07-31",
    priority: "urgent",
    status: "active",
  },
  {
    text: "After signing Frankfurt lease → Anmeldung at Frankfurt Bürgeramt within 14 days.",
    priority: "urgent",
    status: "active",
  },
  {
    text: "Apply for 3-year residence permit at Frankfurt Ausländerbehörde (needs Anmeldung + enrollment + financial means + insurance).",
    priority: "urgent",
    status: "active",
  },
  {
    text: 'Reply to Katharina Forster about "Green Tea with P" — German or English? Event date is set only after you answer. forster@nachhaltigkeit.uni-frankfurt.de',
    priority: "urgent",
    status: "active",
  },
  {
    text: "Confirm Jam Session participation and send performance details to Faustino. Event: Tue 1 July 2026, 18:00–22:00. faustino@hochschulsport.uni-frankfurt.de",
    due_date: "2026-07-01",
    priority: "urgent",
    status: "active",
  },
  {
    text: "Close the Commerzbank bank account.",
    priority: "urgent",
    status: "active",
  },
  {
    text: "Complete Bhavin's task.",
    priority: "urgent",
    status: "active",
  },
  {
    text: "Submit Personal Finance block seminar slides (Prof. Hackethal) — merge your group's slides into ONE file (pptx/pdf) and send to Aylin Cam. Deadline was Thu 18 June, 8:00 AM. If not yet sent, email immediately. Schedule is on OLAT.",
    due_date: "2026-06-18",
    priority: "urgent",
    status: "active",
  },
  {
    text: "Sign the new HiWi contract at the Quantum Computing group with Beatriz Lopes Abreu — 5-month position offered 15 June. Finalize the in-person signature. lopesabreu@em.uni-frankfurt.de (cc jattana@em.uni-frankfurt.de)",
    priority: "urgent",
    status: "active",
  },

  // ── IMPORTANT ──
  {
    text: "Reply to Prof. Jattana about the HiWi contract extension (he said discuss week of 8 June). jattana@em.uni-frankfurt.de",
    priority: "important",
    status: "active",
  },
  {
    text: "Activate Goethe-Campus applicant account (email 2 Jun) and check next steps. goethe-campus.uni-frankfurt.de",
    priority: "important",
    status: "active",
  },
  {
    text: "Attend ENTER_ZUKUNFT_WIWI job fair — Thu 11 June 2026, Hörsaalzentrum, Campus Westend.",
    due_date: "2026-06-11",
    priority: "important",
    status: "active",
  },
  {
    text: "Pass all the fundamental exams with flying colours.",
    priority: "important",
    status: "active",
  },
  {
    text: "Apply for backup universities and courses in Germany (low/no-fee, public, English-taught).",
    priority: "important",
    status: "active",
  },
  {
    text: "Apply for research assistant roles at Goethe; follow up on the Prof. Storz application (Kiradjieva said Storz would reply soon). kiradjieva@em.uni-frankfurt.de",
    priority: "important",
    status: "active",
  },
  {
    text: "Apply for full-time permanent jobs in German IT companies.",
    priority: "important",
    status: "active",
  },
  {
    text: "Get B1 German certificate by 16 August 2026.",
    due_date: "2026-08-16",
    priority: "important",
    status: "active",
  },
  {
    text: "Aim for 1.0 in first semester — study Economics, all subjects, daily.",
    priority: "important",
    status: "active",
  },
  {
    text: "Mail professors in Austria, Switzerland, Netherlands, UK, and Scandinavian countries for research/job outreach. Note: University of Vienna contact #1 not working — find alternative.",
    priority: "important",
    status: "active",
  },
  {
    text: "Check GROW@Goethe Mentoring OLAT course for unread announcements (new post 2 Jun).",
    priority: "important",
    status: "active",
  },
  {
    text: "Have updated English CV in tabular format ready (jobs + applications).",
    priority: "important",
    status: "active",
  },

  {
    text: "Apply for the Goethe Abschlussstipendium (final scholarship for international students) — application deadline 30 June 2026. stipendien@uni-frankfurt.de",
    due_date: "2026-06-30",
    priority: "important",
    status: "active",
  },

  // ── TO-DO ──
  {
    text: "Once you have a full-time IT job, switch to work visa and finish the Master.",
    priority: "todo",
    status: "active",
  },
  {
    text: "Reach 72 kg target weight by 16 August 2026.",
    due_date: "2026-08-16",
    priority: "todo",
    status: "active",
  },
  {
    text: "Junges Forum Demokratie scholarship (Stiftung Polytechnische Gesellschaft) — deadline 30 June 2026, via GROW@Goethe OLAT.",
    due_date: "2026-06-30",
    priority: "todo",
    status: "active",
  },
  {
    text: "Register for International Career Service Rhein-Main workshops (TU Darmstadt). icsrm@tu-darmstadt.de",
    priority: "todo",
    status: "active",
  },
  {
    text: "Resend English Theatre request to Mathilde Charras (mathilde.charras@english-theatre.de) — Marina Brunner has left.",
    priority: "todo",
    status: "active",
  },
  {
    text: "Reply to GStEP photo consent (yes/no on March ECB tour group photos). gstep@uni-frankfurt.de",
    priority: "todo",
    status: "active",
  },
  {
    text: "Dance Night Hawaii (Standard & Latein) — 17 July 2026, RSVP if attending. hoffmann@hochschulsport.uni-frankfurt.de",
    due_date: "2026-07-17",
    priority: "todo",
    status: "active",
  },
  {
    text: "Decide on LAUNCH Build Days hackathon (showed interest in January). applications@launch-rm.de",
    priority: "todo",
    status: "active",
  },
  {
    text: "Respond to Kleinanzeigen buyers for birthday-decoration listings if still selling.",
    priority: "todo",
    status: "active",
  },
  {
    text: "Register on the SWFFM student-dorm waiting list — swffm.de/wohnen/wohnheime. Recommended by Sale (ieep) as the first step for Frankfurt housing; waiting list is long, so start now.",
    priority: "todo",
    status: "active",
  },
  {
    text: "Vote shares: Infosys & Bank of Baroda shareholder e-voting via CDSL — e-voting window closes 22 June 2026 (AGMs 23 June).",
    due_date: "2026-06-22",
    priority: "todo",
    status: "active",
  },
  {
    text: "Café Sprachwelten — language games café. Thu 18 June, 17:00–19:00, Room 14, ISZ Container (Campus Westend, Building 17). No registration; drop in. 3 sessions of ≥45 min → certificate of participation.",
    due_date: "2026-06-18",
    priority: "todo",
    status: "active",
  },
  {
    text: "MIEEP / SAFE panel discussion 'Auf dem Weg zur Klimaneutralität – Die Rolle des Finanzsektors' (German). Fri 19 June, 11:00–12:30. Register on the SAFE Frankfurt events site. ieep@wiwi.uni-frankfurt.de",
    due_date: "2026-06-19",
    priority: "todo",
    status: "active",
  },
  {
    text: "Mountain Sports Excursion (Hochschulsport) — Kleinwalsertal, Sun 20–Fri 25 Sep 2026 (hikes: Schwarzwasserhütte, Ifen, Breitachklamm). Registration deadline 14 June already passed — email to ask if a late spot is available. info@hochschulsport.uni-frankfurt.de",
    priority: "todo",
    status: "active",
  },
  {
    text: "CHE Hochschulranking 2026 — fill out the master's-programme ranking survey (optional). befragung@uni-frankfurt.de",
    priority: "todo",
    status: "active",
  },

  // ── COMPLETED ──
  { text: "Build a personal website to track tasks and life", priority: "important", status: "done" },
  { text: "Inform Goethe Global Office about not going to Rotterdam for Erasmus", priority: "urgent", status: "done" },
  { text: "Reply to professor about the student assistant position", priority: "important", status: "done" },
  { text: "Send mail to English Theatre for tickets and timesheet", priority: "todo", status: "done" },
  { text: "Compare salary with the contract and report discrepancies", priority: "important", status: "done" },
  { text: "Follow up with Ramya about her work and the meeting time", priority: "todo", status: "done" },
  { text: "Watch the English Theatre shows and make notes", priority: "todo", status: "done" },
  { text: "Buy onion, eggs and potato", priority: "todo", status: "done" },
  { text: "Buy sunscreen, facewash, night cream and soap", priority: "todo", status: "done" },
  { text: "Go to FUAS and attend the welcome week", priority: "todo", status: "done" },
  { text: "Get tickets for the English Theatre", priority: "todo", status: "done" },
  { text: "Transfer money to Jemmy and Hasnain", priority: "todo", status: "done" },
  { text: "Transfer insurance amount to the provider", priority: "important", status: "done" },
  { text: "Ask Lucas about HiWi contract extension and mail professors for HiWi job", priority: "important", status: "done" },
  { text: "Send mail to Lucas and Prof. Jattana", priority: "important", status: "done" },
];
