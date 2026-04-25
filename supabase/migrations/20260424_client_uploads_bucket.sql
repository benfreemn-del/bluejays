-- client-uploads Supabase Storage bucket
--
-- Holds files uploaded by paid prospects through the 3-step post-purchase
-- onboarding form (`/onboarding/[id]`). Logo on Step 1, photos on Step 2.
-- Path layout: client-uploads/{prospectId}/{type}/{timestamp}-{filename}
-- where `type` is "logo" or "photos".
--
-- The bucket is also auto-created idempotently by
-- src/app/api/onboarding/upload/[id]/route.ts on first upload via
-- ensureClientUploadsBucket() — this migration documents the canonical
-- config so the bucket exists pre-emptively in production.
--
-- Public read: files are referenced by URL from the rendered preview site
-- and surfaced back to the operator dashboard, so anonymous access is
-- expected. Write access goes through the API route which validates
-- prospect ownership server-side.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-uploads',
  'client-uploads',
  true,
  10485760, -- 10MB per file (5MB enforced for logos at the API layer)
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
