create extension if not exists pgcrypto;

create type public.complaint_category as enum ('safety', 'harassment', 'facilities', 'academic', 'other');
create type public.complaint_status as enum ('submitted', 'under_review', 'in_progress', 'resolved', 'closed');
create type public.complaint_priority as enum ('normal', 'high', 'urgent');
create type public.help_type as enum ('help', 'collaboration');
create type public.lf_type as enum ('lost', 'found');
create type public.notice_priority as enum ('normal', 'important', 'urgent');

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  roll_number text unique,
  department text,
  year_of_study smallint check (year_of_study between 1 and 8),
  avatar_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default upper(encode(gen_random_bytes(5), 'hex')),
  user_id uuid not null references auth.users(id) on delete restrict,
  category public.complaint_category not null,
  title text not null check (length(title) between 4 and 140),
  description text not null check (length(description) between 10 and 10000),
  location text,
  incident_date date,
  status public.complaint_status not null default 'submitted',
  priority public.complaint_priority not null default 'normal',
  is_anonymous boolean not null default true,
  admin_notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.complaint_evidence (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  storage_path text not null,
  file_type text not null,
  uploaded_at timestamptz not null default now()
);

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  anonymous_alias text not null,
  type public.help_type not null,
  title text not null check (length(title) between 4 and 140),
  description text not null check (length(description) between 10 and 5000),
  category text not null,
  skills_needed text[] not null default '{}',
  team_size smallint check (team_size between 1 and 30),
  tech_stack text[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed', 'hidden')),
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lost_found_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  type public.lf_type not null,
  item_name text not null check (length(item_name) between 2 and 120),
  category text not null,
  description text not null check (length(description) between 5 and 3000),
  location text not null,
  incident_date date,
  status text not null default 'active' check (status in ('active', 'resolved', 'hidden')),
  is_claimed boolean not null default false,
  contact_via text not null default 'platform' check (contact_via in ('platform', 'email', 'phone')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lost_found_claims (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.lost_found_posts(id) on delete cascade,
  claimant_id uuid not null references auth.users(id) on delete restrict,
  description text not null check (length(description) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (post_id, claimant_id)
);

create table public.notice_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#547733',
  icon text not null default 'megaphone'
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  published_by uuid references auth.users(id) on delete set null,
  category_id uuid references public.notice_categories(id) on delete set null,
  title text not null check (length(title) between 4 and 180),
  description text not null check (length(description) between 10 and 10000),
  department text,
  attachment_path text,
  priority public.notice_priority not null default 'normal',
  is_published boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  target_batch text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete restrict,
  target_type text not null,
  target_id uuid not null,
  reason text not null check (length(reason) between 5 and 2000),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  action_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index complaints_owner_created_idx on public.complaints (user_id, created_at desc);
create index complaints_reference_idx on public.complaints (reference_code);
create index help_requests_feed_idx on public.help_requests (status, created_at desc);
create index lost_found_feed_idx on public.lost_found_posts (status, created_at desc);
create index notices_feed_idx on public.notices (is_published, published_at desc);
create index notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger complaints_updated_at before update on public.complaints for each row execute function public.set_updated_at();
create trigger help_requests_updated_at before update on public.help_requests for each row execute function public.set_updated_at();
create trigger lost_found_updated_at before update on public.lost_found_posts for each row execute function public.set_updated_at();
create trigger notices_updated_at before update on public.notices for each row execute function public.set_updated_at();

insert into public.notice_categories (name, color, icon) values
  ('Academic', '#547733', 'book-open'),
  ('Events', '#9b7326', 'calendar-days'),
  ('Deadlines', '#bd5b43', 'clock-3'),
  ('Campus life', '#467579', 'users-round')
on conflict (name) do nothing;
