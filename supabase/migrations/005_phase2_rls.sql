alter table public.support_requests enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.accommodation_locations enable row level security;
alter table public.accommodation_listings enable row level security;
alter table public.marketplace_listings enable row level security;

create or replace function public.can_access_chat_room(target_room uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.chat_participants cp
    where cp.room_id = target_room and cp.user_id = (select auth.uid())
  ) or exists (
    select 1 from public.chat_rooms cr
    join public.help_requests hr on hr.id = cr.request_id
    where cr.id = target_room and hr.user_id = (select auth.uid())
  ) or (select public.current_app_role()) in ('admin', 'moderator');
$$;
revoke all on function public.can_access_chat_room(uuid) from public, anon;
grant execute on function public.can_access_chat_room(uuid) to authenticated;

create policy "support_owner_or_staff_read" on public.support_requests for select to authenticated
  using (user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator', 'counselor', 'mentor'));
create policy "support_owner_insert" on public.support_requests for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "support_staff_update" on public.support_requests for update to authenticated
  using ((select public.current_app_role()) in ('admin', 'moderator', 'counselor', 'mentor'))
  with check ((select public.current_app_role()) in ('admin', 'moderator', 'counselor', 'mentor'));

create policy "chat_rooms_participant_read" on public.chat_rooms for select to authenticated
  using ((select public.can_access_chat_room(id)));
create policy "chat_participants_room_read" on public.chat_participants for select to authenticated
  using ((select public.can_access_chat_room(room_id)));
create policy "chat_messages_participant_read" on public.chat_messages for select to authenticated
  using ((select public.can_access_chat_room(room_id)));
create policy "chat_messages_participant_insert" on public.chat_messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and (select public.can_access_chat_room(room_id)));

create policy "accommodation_locations_active_read" on public.accommodation_locations for select to authenticated
  using (is_active or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "accommodation_locations_staff_manage" on public.accommodation_locations for all to authenticated
  using ((select public.current_app_role()) in ('admin', 'moderator'))
  with check ((select public.current_app_role()) in ('admin', 'moderator'));
create policy "accommodation_listings_active_read" on public.accommodation_listings for select to authenticated
  using ((status = 'active' and is_verified) or owner_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "accommodation_owner_insert" on public.accommodation_listings for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "accommodation_owner_update" on public.accommodation_listings for update to authenticated
  using (owner_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'))
  with check (owner_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));

create policy "marketplace_active_read" on public.marketplace_listings for select to authenticated
  using ((status = 'active' and not is_sold) or seller_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "marketplace_owner_insert" on public.marketplace_listings for insert to authenticated
  with check (seller_id = (select auth.uid()));
create policy "marketplace_owner_update" on public.marketplace_listings for update to authenticated
  using (seller_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'))
  with check (seller_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));

revoke all on public.support_requests, public.chat_rooms, public.chat_participants,
  public.chat_messages, public.accommodation_locations, public.accommodation_listings,
  public.marketplace_listings from anon, authenticated;

grant select (id, type, category, message, status, is_confidential, created_at, updated_at) on public.support_requests to authenticated;
grant insert (user_id, type, category, message, is_confidential) on public.support_requests to authenticated;
grant update (status, assigned_to) on public.support_requests to authenticated;

grant select (id, request_id, created_at) on public.chat_rooms to authenticated;
grant select (id, room_id, anonymous_alias, joined_at) on public.chat_participants to authenticated;
grant select (id, room_id, sender_alias, content, is_deleted, created_at) on public.chat_messages to authenticated;
grant insert (room_id, sender_id, sender_alias, content) on public.chat_messages to authenticated;

grant select (id, name, distance_km, is_active, created_at) on public.accommodation_locations to authenticated;
grant select (id, location_id, title, type, rent, deposit, description, is_verified, status, created_at, updated_at) on public.accommodation_listings to authenticated;
grant insert (location_id, owner_id, title, type, rent, deposit, description) on public.accommodation_listings to authenticated;
grant update (location_id, title, type, rent, deposit, description, status) on public.accommodation_listings to authenticated;

grant select (id, title, category, price, condition, description, status, is_sold, created_at, updated_at) on public.marketplace_listings to authenticated;
grant insert (seller_id, title, category, price, condition, description) on public.marketplace_listings to authenticated;
grant update (title, category, price, condition, description, status, is_sold) on public.marketplace_listings to authenticated;
