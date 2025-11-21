create table if not exists public.profiles (
  id uuid primary key,
  email text not null,
  plan text default 'free',
  prompt_quota_used integer default 0,
  improvements_used_today integer default 0,
  improvements_reset_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  summary text,
  content text not null,
  ai_improvement_source text,
  category text not null,
  tags text[] default '{}',
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz,
  use_count integer default 0,
  thumbnail_url text
);

create table if not exists public.prompt_improvements (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references public.prompts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  original_content text not null,
  improved_content text not null,
  diff_json jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_improvements enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Prompts are viewable by owner" on public.prompts
  for select using (auth.uid() = user_id);
create policy "Prompts insert" on public.prompts
  for insert with check (auth.uid() = user_id);
create policy "Prompts update" on public.prompts
  for update using (auth.uid() = user_id);
create policy "Prompts delete" on public.prompts
  for delete using (auth.uid() = user_id);

create policy "Improvements view" on public.prompt_improvements
  for select using (auth.uid() = user_id);
create policy "Improvements insert" on public.prompt_improvements
  for insert with check (auth.uid() = user_id);

create or replace function public.get_user_tags(target_user_id uuid)
returns text[]
language sql
stable
as $$
  select coalesce(array_agg(tag order by tag), '{}')
  from (
    select distinct unnest(tags) as tag
    from public.prompts
    where user_id = target_user_id
      and array_length(tags, 1) > 0
  ) as distinct_tags;
$$;

create or replace function public.increment_prompt_use_count(target_prompt_id uuid)
returns integer
language sql
as $$
  update public.prompts
  set use_count = coalesce(use_count, 0) + 1
  where id = target_prompt_id
    and auth.uid() = user_id
  returning use_count;
$$;

create or replace function public.reset_daily_improvements(target_user_id uuid)
returns public.profiles
language sql
volatile
as $$
  update public.profiles
  set improvements_used_today = 0,
      improvements_reset_at = now()
  where id = target_user_id
    and (
      improvements_reset_at is null
      or improvements_reset_at::date < now()::date
    )
  returning *;
$$;
