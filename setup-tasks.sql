-- ============================================================
-- Run ONCE in Supabase SQL Editor to set up your full task list.
-- WARNING: delete from tasks; removes all existing tasks first.
-- ============================================================

alter table tasks add column if not exists priority text not null default 'todo';

delete from tasks;

-- ACTIVE — URGENT (immigration chain first, then time-sensitive)
insert into tasks (text, status, priority, completed_at) values
  ('Apply for Fiktionsbescheinigung at Frankfurt Ausländerbehörde (Rödelbergweg) — on current Bad Vilbel address, before visa expires 9 Oct 2026. Bring: passport, visa, enrollment proof, biometric photo, fee, insurance, housing search evidence.', 'active', 'urgent', null),
  ('Find accommodation in Frankfurt city (Stadtgebiet, max ~€400 warm, from 1 July). Kleinanzeigen WG lead deleted 5 June — keep searching.', 'active', 'urgent', null),
  ('Pay Goethe semester fee €408.28 by 31 July 2026 (Rückmeldung WiSe 2026/27). IBAN DE18 5005 0000 0001 006535, BIC HELADEF1, ref = Matrikelnummer.', 'active', 'urgent', null),
  ('After signing Frankfurt lease → Anmeldung at Frankfurt Bürgeramt within 14 days.', 'active', 'urgent', null),
  ('Apply for 3-year residence permit at Frankfurt Ausländerbehörde (needs Anmeldung + enrollment + financial means + insurance).', 'active', 'urgent', null),
  ('Reply to Katharina Forster — Green Tea with P: German or English? forster@nachhaltigkeit.uni-frankfurt.de', 'active', 'urgent', null),
  ('Confirm Jam Session + send performance details to Faustino. Tue 1 July 2026, 18:00–22:00. faustino@hochschulsport.uni-frankfurt.de', 'active', 'urgent', null),
  ('Close the Commerzbank bank account.', 'active', 'urgent', null),
  ('Complete Bhavin''s task.', 'active', 'urgent', null);

-- ACTIVE — IMPORTANT
insert into tasks (text, status, priority, completed_at) values
  ('Reply to Prof. Jattana about HiWi contract extension. jattana@em.uni-frankfurt.de', 'active', 'important', null),
  ('Activate Goethe-Campus applicant account and check next steps. goethe-campus.uni-frankfurt.de', 'active', 'important', null),
  ('Attend ENTER_ZUKUNFT_WIWI job fair — Thu 11 June 2026, Hörsaalzentrum, Campus Westend.', 'active', 'important', null),
  ('Pass all the fundamental exams with flying colours.', 'active', 'important', null),
  ('Apply for backup universities in Germany (low/no-fee, public, English-taught).', 'active', 'important', null),
  ('Apply for research assistant roles at Goethe; follow up Prof. Storz (kiradjieva@em.uni-frankfurt.de).', 'active', 'important', null),
  ('Apply for full-time permanent jobs in German IT companies.', 'active', 'important', null),
  ('Get B1 German certificate by 16 August 2026.', 'active', 'important', null),
  ('Aim for 1.0 in first semester — study Economics daily.', 'active', 'important', null),
  ('Mail professors in Austria, Switzerland, Netherlands, UK, Scandinavia for research/job outreach.', 'active', 'important', null),
  ('Check GROW@Goethe Mentoring OLAT for unread announcements.', 'active', 'important', null),
  ('Have updated English CV in tabular format ready (jobs + applications).', 'active', 'important', null);

-- ACTIVE — TO-DO
insert into tasks (text, status, priority, completed_at) values
  ('Once you have a full-time IT job, switch to work visa and finish the Master.', 'active', 'todo', null),
  ('Reach 72 kg target weight by 16 August 2026.', 'active', 'todo', null),
  ('Junges Forum Demokratie scholarship — deadline 30 June 2026 (GROW@Goethe OLAT).', 'active', 'todo', null),
  ('Register for International Career Service workshops (TU Darmstadt). icsrm@tu-darmstadt.de', 'active', 'todo', null),
  ('Resend English Theatre request to Mathilde Charras (mathilde.charras@english-theatre.de).', 'active', 'todo', null),
  ('Reply to GStEP photo consent. gstep@uni-frankfurt.de', 'active', 'todo', null),
  ('Dance Night Hawaii — 17 July 2026. hoffmann@hochschulsport.uni-frankfurt.de', 'active', 'todo', null),
  ('Decide on LAUNCH Build Days hackathon. applications@launch-rm.de', 'active', 'todo', null),
  ('Respond to Kleinanzeigen buyers for birthday-decoration listings.', 'active', 'todo', null);

-- COMPLETED
insert into tasks (text, status, priority, completed_at) values
  ('Build a personal website to track tasks and life', 'done', 'important', now()),
  ('Inform Goethe Global Office about not going to Rotterdam for Erasmus', 'done', 'urgent', now()),
  ('Reply to professor about the student assistant position', 'done', 'important', now()),
  ('Send mail to English Theatre for tickets and timesheet', 'done', 'todo', now()),
  ('Compare salary with the contract and report discrepancies', 'done', 'important', now()),
  ('Follow up with Ramya about her work and the meeting time', 'done', 'todo', now()),
  ('Watch the English Theatre shows and make notes', 'done', 'todo', now()),
  ('Buy onion, eggs and potato', 'done', 'todo', now()),
  ('Buy sunscreen, facewash, night cream and soap', 'done', 'todo', now()),
  ('Go to FUAS and attend the welcome week', 'done', 'todo', now()),
  ('Get tickets for the English Theatre', 'done', 'todo', now()),
  ('Transfer money to Jemmy and Hasnain', 'done', 'todo', now()),
  ('Transfer insurance amount to the provider', 'done', 'important', now()),
  ('Ask Lucas about HiWi contract extension and mail professors for HiWi job', 'done', 'important', now()),
  ('Send mail to Lucas and Prof. Jattana', 'done', 'important', now());
