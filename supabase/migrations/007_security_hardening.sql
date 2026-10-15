-- ==============================================================================
-- 007_security_hardening.sql
-- Security fixes for Supabase Storage, Row Level Security, and Functions
-- ==============================================================================

-- 1. Fix Storage RLS policies for complaint-evidence
-- Drop insecure storage policies that did not verify user ownership of complaint
drop policy if exists "complaint_evidence_owner_upload" on storage.objects;
drop policy if exists "complaint_evidence_owner_or_staff_read" on storage.objects;

-- Ensure uploads are strictly scoped to the owner of the specific complaint
create policy "complaint_evidence_owner_upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'complaint-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.complaints c
      where c.id::text = (storage.foldername(name))[2]
        and c.user_id = (select auth.uid())
    )
  );

-- Ensure reads require complaint ownership OR authorized staff role (admin/moderator)
create policy "complaint_evidence_owner_or_staff_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'complaint-evidence'
    and (
      (
        (storage.foldername(name))[1] = (select auth.uid())::text
        and exists (
          select 1 from public.complaints c
          where c.id::text = (storage.foldername(name))[2]
            and c.user_id = (select auth.uid())
        )
      )
      or (select public.current_app_role()) in ('admin', 'moderator')
    )
  );

-- 2. Explicitly revoke anon access from storage bucket
revoke all on storage.objects from anon;

-- 3. Harden role helper with empty search path to prevent search_path hijacking
create or replace function public.current_app_role()
returns text language sql stable security invoker set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'student');
$$;

-- 4. Ensure admin_audit_logs cannot be tampered with or modified by anyone
revoke update, delete on public.admin_audit_logs from anon, authenticated;

-- 5. Revoke execute on sensitive internal functions from public and anon
revoke execute on all functions in schema public from anon;
