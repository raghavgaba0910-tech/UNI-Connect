-- Client roles receive only the columns needed for public, anonymous-safe listings.
-- RLS remains the row-level boundary; omitted owner columns are not selectable.
revoke all on public.profiles, public.complaints, public.complaint_evidence,
	public.help_requests, public.lost_found_posts, public.lost_found_claims,
	public.notice_categories, public.notices, public.reports, public.notifications,
	public.admin_audit_logs from anon, authenticated;

grant select (id, display_name, roll_number, department, year_of_study, avatar_url, is_verified, created_at, updated_at) on public.profiles to authenticated;
grant insert (id, display_name, roll_number, department, year_of_study, avatar_url) on public.profiles to authenticated;
grant update (display_name, department, year_of_study, avatar_url) on public.profiles to authenticated;
grant select (id, name, color, icon) on public.notice_categories to authenticated;

revoke all on public.complaints from anon, authenticated;
grant select (id, reference_code, category, title, description, location, incident_date, status, priority, is_anonymous, created_at, updated_at) on public.complaints to authenticated;
grant insert (user_id, category, title, description, location, incident_date, is_anonymous) on public.complaints to authenticated;
grant update (title, description, location, incident_date) on public.complaints to authenticated;

revoke all on public.help_requests from anon, authenticated;
grant select (id, anonymous_alias, type, title, description, category, skills_needed, team_size, tech_stack, status, is_anonymous, created_at, updated_at) on public.help_requests to authenticated;
grant insert (user_id, anonymous_alias, type, title, description, category, skills_needed, team_size, tech_stack, is_anonymous) on public.help_requests to authenticated;
grant update (title, description, category, skills_needed, team_size, tech_stack, status) on public.help_requests to authenticated;

revoke all on public.lost_found_posts from anon, authenticated;
revoke all on public.lost_found_claims from anon, authenticated;
grant select (id, post_id, description, status, created_at) on public.lost_found_claims to authenticated;
grant insert (post_id, claimant_id, description) on public.lost_found_claims to authenticated;
grant update (status) on public.lost_found_claims to authenticated;
revoke all on public.complaint_evidence from anon, authenticated;
grant select (id, complaint_id, file_type, uploaded_at) on public.complaint_evidence to authenticated;
grant insert (complaint_id, storage_path, file_type) on public.complaint_evidence to authenticated;
grant select (id, type, item_name, category, description, location, incident_date, status, is_claimed, contact_via, created_at, updated_at) on public.lost_found_posts to authenticated;
grant insert (user_id, type, item_name, category, description, location, incident_date, contact_via) on public.lost_found_posts to authenticated;
grant update (type, item_name, category, description, location, incident_date, status, is_claimed, contact_via) on public.lost_found_posts to authenticated;

grant select (id, name, color, icon) on public.notice_categories to authenticated;
revoke all on public.notices from anon, authenticated;
grant select (id, category_id, title, description, department, attachment_path, priority, is_published, published_at, expires_at, target_batch, created_at, updated_at) on public.notices to authenticated;
grant insert (published_by, category_id, title, description, department, attachment_path, priority, is_published, published_at, expires_at, target_batch) on public.notices to authenticated;
grant update (category_id, title, description, department, attachment_path, priority, is_published, published_at, expires_at, target_batch) on public.notices to authenticated;

revoke all on public.reports from anon, authenticated;
grant select (id, target_type, target_id, reason, status, created_at) on public.reports to authenticated;
grant insert (reporter_id, target_type, target_id, reason) on public.reports to authenticated;
grant update (status, reviewed_by) on public.reports to authenticated;

revoke all on public.notifications from anon, authenticated;
grant select (id, type, title, body, action_url, is_read, created_at) on public.notifications to authenticated;
grant update (is_read) on public.notifications to authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;
grant select (id, action, target_type, target_id, details, created_at) on public.admin_audit_logs to authenticated;
grant insert (admin_id, action, target_type, target_id, details) on public.admin_audit_logs to authenticated;

-- Do not expose internal owner/reporter/assignee IDs through PostgREST.
revoke select (user_id) on public.complaints, public.help_requests, public.lost_found_posts, public.notifications from anon, authenticated;
revoke select (reporter_id, reviewed_by) on public.reports from anon, authenticated;
revoke select (assigned_to, admin_notes) on public.complaints from anon, authenticated;
revoke select (admin_id) on public.admin_audit_logs from anon, authenticated;
