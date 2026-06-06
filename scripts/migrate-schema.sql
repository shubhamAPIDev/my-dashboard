-- Schema additions for structured tasks (run once if columns missing)
alter table tasks add column if not exists notes text;
alter table tasks add column if not exists due_date date;
alter table tasks add column if not exists category text;
alter table tasks add column if not exists step_order smallint;

-- Then run: node scripts/seed-tasks.mjs (with .env.local loaded)
