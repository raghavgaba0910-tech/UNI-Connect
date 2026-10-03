alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_evidence enable row level security;
alter table public.help_requests enable row level security;
alter table public.lost_found_posts enable row level security;
alter table public.lost_found_claims enable row level security;
alter table public.notice_categories enable row level security;
alter table public.notices enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_audit_logs enable row level security;

create or replace function public.current_app_role()
returns text language sql stable security invoker set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'student');
$$;

create policy "profiles_read_self_or_admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "profiles_update_self" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles_insert_self" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

create policy "complaints_owner_or_staff_read" on public.complaints for select to authenticated
  using (user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "complaints_owner_insert" on public.complaints for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "complaints_owner_read_only_update" on public.complaints for update to authenticated
  using ((user_id = (select auth.uid()) and status = 'submitted') or (select public.current_app_role()) in ('admin', 'moderator'))
  with check ((user_id = (select auth.uid()) and status = 'submitted') or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "complaints_staff_delete" on public.complaints for delete to authenticated
  using ((select public.current_app_role()) = 'admin');

create policy "evidence_owner_or_staff_read" on public.complaint_evidence for select to authenticated
  using (exists (select 1 from public.complaints c where c.id = complaint_id and (c.user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'))));
create policy "evidence_owner_insert" on public.complaint_evidence for insert to authenticated
  with check (exists (select 1 from public.complaints c where c.id = complaint_id and c.user_id = (select auth.uid())));

create policy "help_read_open_or_own" on public.help_requests for select to authenticated
  using ((status = 'open' and is_anonymous) or user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "help_owner_insert" on public.help_requests for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "help_owner_update" on public.help_requests for update to authenticated
  using (user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'))
  with check (user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));

create policy "lost_found_read_active" on public.lost_found_posts for select to authenticated
  using (status = 'active' or user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "lost_found_owner_insert" on public.lost_found_posts for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "lost_found_owner_update" on public.lost_found_posts for update to authenticated
  using (user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'))
  with check (user_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));

create policy "claims_read_involved_or_staff" on public.lost_found_claims for select to authenticated
  using (claimant_id = (select auth.uid()) or exists (select 1 from public.lost_found_posts p where p.id = post_id and p.user_id = (select auth.uid())) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "claims_claimant_insert" on public.lost_found_claims for insert to authenticated
  with check (claimant_id = (select auth.uid()));
create policy "claims_staff_update" on public.lost_found_claims for update to authenticated
  using (exists (select 1 from public.lost_found_posts p where p.id = post_id and p.user_id = (select auth.uid())) or (select public.current_app_role()) in ('admin', 'moderator'))
  with check (exists (select 1 from public.lost_found_posts p where p.id = post_id and p.user_id = (select auth.uid())) or (select public.current_app_role()) in ('admin', 'moderator'));

create policy "notice_categories_read" on public.notice_categories for select to authenticated using (true);
create policy "notices_read_published_or_staff" on public.notices for select to authenticated
  using (is_published or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "notices_staff_insert" on public.notices for insert to authenticated
  with check ((select public.current_app_role()) in ('admin', 'moderator') and published_by = (select auth.uid()));
create policy "notices_staff_update" on public.notices for update to authenticated
  using ((select public.current_app_role()) in ('admin', 'moderator')) with check ((select public.current_app_role()) in ('admin', 'moderator'));
create policy "notices_admin_delete" on public.notices for delete to authenticated
  using ((select public.current_app_role()) = 'admin');

create policy "reports_reporter_or_staff_read" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.current_app_role()) in ('admin', 'moderator'));
create policy "reports_reporter_insert" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "reports_staff_update" on public.reports for update to authenticated
  using ((select public.current_app_role()) in ('admin', 'moderator')) with check ((select public.current_app_role()) in ('admin', 'moderator'));

create policy "notifications_owner_read" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "notifications_owner_update" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "audit_admin_read" on public.admin_audit_logs for select to authenticated
  using ((select public.current_app_role()) = 'admin');
create policy "audit_admin_insert" on public.admin_audit_logs for insert to authenticated
  with check ((select public.current_app_role()) = 'admin' and admin_id = (select auth.uid()));

-- Anonymous clients must not query base tables. Add anonymous, field-limited views/RPCs
-- only when implementing the corresponding server-side workflows.
revoke all on public.profiles, public.complaints, public.complaint_evidence,
  public.help_requests, public.lost_found_posts, public.lost_found_claims,
  public.notice_categories, public.notices, public.reports, public.notifications,
  public.admin_audit_logs from anon;
