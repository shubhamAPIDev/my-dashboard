-- Run this in your Supabase SQL editor
create table if not exists events (
  id bigserial primary key,
  title text not null,
  event_date date not null,
  event_time time,
  notes text,
  created_at timestamptz default now()
);
