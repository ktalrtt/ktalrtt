-- Kỷ yếu: shared configuration with secure admin-only writes.
-- Run this in Supabase Dashboard > SQL Editor after creating the project.

create table if not exists public.site_settings (
  id text primary key default 'main',
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
revoke all on public.site_admins from anon, authenticated;
grant select on public.site_admins to authenticated;

drop policy if exists "Public can read shared site config" on public.site_settings;
create policy "Public can read shared site config"
on public.site_settings for select to anon, authenticated
using (id = 'main');

drop policy if exists "Admins can insert shared site config" on public.site_settings;
create policy "Admins can insert shared site config"
on public.site_settings for insert to authenticated
with check (
  id = 'main'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

drop policy if exists "Admins can update shared site config" on public.site_settings;
create policy "Admins can update shared site config"
on public.site_settings for update to authenticated
using (
  id = 'main'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
)
with check (
  id = 'main'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

-- Storage bucket for shared images/audio. Upload/write is admin-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('yearbook-media', 'yearbook-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/ogg','audio/wav','audio/mp4'])
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "Public can view yearbook media" on storage.objects;
create policy "Public can view yearbook media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'yearbook-media');

drop policy if exists "Admins can upload yearbook media" on storage.objects;
create policy "Admins can upload yearbook media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'yearbook-media'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

drop policy if exists "Admins can update yearbook media" on storage.objects;
create policy "Admins can update yearbook media"
on storage.objects for update to authenticated
using (
  bucket_id = 'yearbook-media'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
)
with check (
  bucket_id = 'yearbook-media'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

drop policy if exists "Admins can delete yearbook media" on storage.objects;
create policy "Admins can delete yearbook media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'yearbook-media'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

-- After creating your admin user in Authentication > Users, replace UUID below:
-- insert into public.site_admins (user_id) values ('YOUR-AUTH-USER-UUID');
