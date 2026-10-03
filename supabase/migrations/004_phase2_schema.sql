create type public.support_type as enum ('counselling', 'career');
create type public.accommodation_type as enum ('room', 'flat', 'hostel', 'pg');

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  type public.support_type not null,
  category text not null,
  message text not null check (length(message) between 10 and 5000),
  status text not null default 'pending' check (status in ('pending', 'assigned', 'in_progress', 'resolved', 'closed')),
  is_confidential boolean not null default true,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id)
);

create table public.chat_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  anonymous_alias text not null,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  sender_alias text not null,
  content text not null check (length(content) between 1 and 5000),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.accommodation_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  distance_km numeric(5,2) check (distance_km >= 0),
  created_by uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.accommodation_listings (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.accommodation_locations(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (length(title) between 4 and 160),
  type public.accommodation_type not null,
  rent numeric(10,2) not null check (rent >= 0),
  deposit numeric(10,2) check (deposit >= 0),
  description text not null default '',
  is_verified boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'rented', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (length(title) between 3 and 160),
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  condition text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'hidden', 'removed')),
  is_sold boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_requests_owner_idx on public.support_requests (user_id, created_at desc);
create index chat_messages_room_idx on public.chat_messages (room_id, created_at desc);
create index accommodation_listings_feed_idx on public.accommodation_listings (status, created_at desc);
create index marketplace_listings_feed_idx on public.marketplace_listings (status, created_at desc);

create trigger support_requests_updated_at before update on public.support_requests for each row execute function public.set_updated_at();
create trigger accommodation_listings_updated_at before update on public.accommodation_listings for each row execute function public.set_updated_at();
create trigger marketplace_listings_updated_at before update on public.marketplace_listings for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
