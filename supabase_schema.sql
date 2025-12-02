-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Enums (Idempotent)
do $$ begin
    create type difficulty_level as enum ('basic', 'intermediate', 'advanced');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type priority_level as enum ('low', 'medium', 'high');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type topic_status as enum ('idea', 'planned', 'in_progress', 'completed');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type course_status as enum ('draft', 'active', 'archived');
exception
    when duplicate_object then null;
end $$;

-- 2. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 3. Learning Topics Table
create table if not exists public.learning_topics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  context_area text,
  difficulty difficulty_level default 'basic',
  priority priority_level default 'medium',
  status topic_status default 'idea',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.learning_topics enable row level security;

drop policy if exists "Users can view own topics" on public.learning_topics;
create policy "Users can view own topics" on public.learning_topics
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own topics" on public.learning_topics;
create policy "Users can insert own topics" on public.learning_topics
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own topics" on public.learning_topics;
create policy "Users can update own topics" on public.learning_topics
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own topics" on public.learning_topics;
create policy "Users can delete own topics" on public.learning_topics
  for delete using (auth.uid() = user_id);

-- 4. Courses Table
create table if not exists public.courses (
  id uuid default uuid_generate_v4() primary key,
  learning_topic_id uuid references public.learning_topics(id) on delete cascade not null,
  title text not null,
  short_summary text,
  difficulty difficulty_level,
  estimated_total_minutes integer,
  status course_status default 'draft',
  source_prompt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.courses enable row level security;

drop policy if exists "Users can view own courses" on public.courses;
create policy "Users can view own courses" on public.courses
  for select using (
    exists (
      select 1 from public.learning_topics
      where learning_topics.id = courses.learning_topic_id
      and learning_topics.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own courses" on public.courses;
create policy "Users can insert own courses" on public.courses
  for insert with check (
    exists (
      select 1 from public.learning_topics
      where learning_topics.id = courses.learning_topic_id
      and learning_topics.user_id = auth.uid()
    )
  );

-- 5. Course Modules Table
create table if not exists public.course_modules (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  order_index integer not null,
  title text not null,
  summary text,
  created_at timestamptz default now()
);

alter table public.course_modules enable row level security;

drop policy if exists "Users can view own modules" on public.course_modules;
create policy "Users can view own modules" on public.course_modules
  for select using (
    exists (
      select 1 from public.courses
      join public.learning_topics on learning_topics.id = courses.learning_topic_id
      where courses.id = course_modules.course_id
      and learning_topics.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own modules" on public.course_modules;
create policy "Users can insert own modules" on public.course_modules
  for insert with check (
    exists (
      select 1 from public.courses
      join public.learning_topics on learning_topics.id = courses.learning_topic_id
      where courses.id = course_id
      and learning_topics.user_id = auth.uid()
    )
  );

-- 6. Course Lessons Table
create table if not exists public.course_lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references public.course_modules(id) on delete cascade not null,
  order_index integer not null,
  title text not null,
  objective text,
  key_points text[],
  estimated_minutes integer,
  practice_task text,
  quiz_question text,
  created_at timestamptz default now()
);

alter table public.course_lessons enable row level security;

drop policy if exists "Users can view own lessons" on public.course_lessons;
create policy "Users can view own lessons" on public.course_lessons
  for select using (
    exists (
      select 1 from public.course_modules
      join public.courses on courses.id = course_modules.course_id
      join public.learning_topics on learning_topics.id = courses.learning_topic_id
      where course_modules.id = course_lessons.module_id
      and learning_topics.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own lessons" on public.course_lessons;
create policy "Users can insert own lessons" on public.course_lessons
  for insert with check (
    exists (
      select 1 from public.course_modules
      join public.courses on courses.id = course_modules.course_id
      join public.learning_topics on learning_topics.id = courses.learning_topic_id
      where course_modules.id = module_id
      and learning_topics.user_id = auth.uid()
    )
  );

-- 7. Functions and Triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

drop trigger if exists update_learning_topics_updated_at on public.learning_topics;
create trigger update_learning_topics_updated_at
    before update on public.learning_topics
    for each row
    execute procedure update_updated_at_column();

drop trigger if exists update_courses_updated_at on public.courses;
create trigger update_courses_updated_at
    before update on public.courses
    for each row
    execute procedure update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing; -- Idempotency for profile creation
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users (requires permissions, usually done in dashboard)
-- We'll try to create it, but if it fails due to permissions, user might need to run it in dashboard SQL editor
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
