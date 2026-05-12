create table if not exists public.early_access_leads (
  id bigint generated always as identity primary key,
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_responses (
  id bigint generated always as identity primary key,
  preferred_language text not null,
  source text not null,
  wanted_feature text not null,
  premium_interest text not null,
  price_expectation text,
  device_type text not null,
  feedback text,
  locale text,
  country_code text,
  created_at timestamptz not null default now()
);

alter table public.survey_responses
add column if not exists price_expectation text;

alter table public.early_access_leads enable row level security;
alter table public.survey_responses enable row level security;

create policy "allow public insert early access"
on public.early_access_leads
for insert
to anon
with check (true);

create policy "allow public insert survey responses"
on public.survey_responses
for insert
to anon
with check (true);

create policy "allow public read early access"
on public.early_access_leads
for select
to anon
using (true);

create policy "allow public read survey responses"
on public.survey_responses
for select
to anon
using (true);