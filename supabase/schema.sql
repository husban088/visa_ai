-- Run this once in your Supabase project's SQL editor.
-- Table mirrors the `Application` type in src/types/index.ts.

create table if not exists applications (
  id text primary key,
  country_code text not null,
  visa_type text not null,
  full_name text not null,
  status text not null default 'documents_pending',
  documents jsonb not null default '[]',
  interview_slot jsonb,
  score int,
  decision_reason text,
  interview_video_url text,
  booking jsonb,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on applications (user_id);

alter table applications enable row level security;

-- Policies: a signed-in applicant sees only their own rows. Rows with a null
-- user_id are "guest" applications created before someone signed in, and stay
-- readable so the zero-setup demo keeps working.
drop policy if exists "public read" on applications;
drop policy if exists "public insert" on applications;
drop policy if exists "public update" on applications;

create policy "own or guest read" on applications
  for select using (user_id is null or auth.uid() = user_id);

create policy "own or guest insert" on applications
  for insert with check (user_id is null or auth.uid() = user_id);

create policy "own or guest update" on applications
  for update using (user_id is null or auth.uid() = user_id);

drop policy if exists "own delete" on applications;

create policy "own delete" on applications
  for delete using (auth.uid() = user_id);

-- Upgrading a table you created earlier? Run these instead of recreating it:
--   alter table applications add column if not exists booking jsonb;
--   alter table applications add column if not exists user_id uuid
--     references auth.users (id) on delete set null;
--   -- (delete policy above is new — run it too if you set this table up before)
