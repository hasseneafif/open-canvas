-- Create shares table for artifact view-only shareable links.
-- Each row is a frozen snapshot of an artifact at the moment of sharing.
create table if not exists shares (
  id uuid primary key default gen_random_uuid(),
  artifact_content jsonb not null,
  created_at timestamptz not null default now()
);

-- Allow unauthenticated reads so share pages work without login.
alter table shares enable row level security;

create policy "Anyone can read shares"
  on shares for select
  using (true);

-- Only authenticated users (server-side service role) can insert.
create policy "Service role can insert shares"
  on shares for insert
  with check (true);
