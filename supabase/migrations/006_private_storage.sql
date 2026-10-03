insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('complaint-evidence', 'complaint-evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "complaint_evidence_owner_upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'complaint-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.complaints c
      where c.id::text = (storage.foldername(name))[2]
    )
  );

create policy "complaint_evidence_owner_or_staff_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'complaint-evidence'
    and exists (
      select 1 from public.complaints c
      where c.id::text = (storage.foldername(name))[2]
    )
  );
