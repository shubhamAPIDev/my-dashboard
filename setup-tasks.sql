-- ============================================================
-- STEP 1: add a priority column to your tasks table
-- ============================================================
alter table tasks add column if not exists priority text not null default 'todo';

-- ============================================================
-- STEP 2: load your 9 immediate tasks with priority levels
-- priority values: 'urgent' | 'important' | 'todo'
-- ============================================================
insert into tasks (text, status, priority, completed_at) values
  ('Find accommodation in Frankfurt city',                                   'active', 'urgent',    null),
  ('Apply for the residence permit and get it for 3 year duration',          'active', 'urgent',    null),
  ('Pass all the fundamental exams with flying colours',                     'active', 'important', null),
  ('Apply for backup universities and courses in Germany',                   'active', 'important', null),
  ('Apply for research assistant role at Goethe University',                 'active', 'important', null),
  ('Apply for full time permanent job in German IT companies',               'active', 'important', null),
  ('Once you have a full time IT job, switch to work visa and finish the master', 'active', 'todo', null),
  ('Inform Goethe Global Office about not going to Rotterdam for Erasmus',    'done',   'urgent',    now()),
  ('Build a personal website to track my tasks and life',                    'done',   'important', now());
