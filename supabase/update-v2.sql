-- =====================================================================
-- JasaKita - PEMBARUAN v2 (aman dijalankan berulang kali)
-- Untuk yang SUDAH pernah menjalankan schema.sql versi lama:
-- Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run
-- (Instalasi baru cukup menjalankan schema.sql, karena sudah memuat isi file ini.)
-- =====================================================================

-- 1) Kolom baru: banyak kategori & layanan per jasa, item permintaan, email kontak
alter table public.services add column if not exists categories text[] not null default '{}';
alter table public.services add column if not exists items text[] not null default '{}';
update public.services set categories = array[category] where categories = '{}' and category <> '';
alter table public.requests add column if not exists item text not null default '';
alter table public.contacts add column if not exists email text not null default '';
update public.contacts c set email = u.email from auth.users u where u.id = c.id and c.email = '';
create index if not exists idx_services_categories on public.services using gin (categories);
create index if not exists idx_services_items on public.services using gin (items);

-- 2) Usulan kategori baru (disetujui Admin)
create table if not exists public.category_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  group_id text not null default 'F',
  category_name text not null check (char_length(category_name) >= 4),
  items text not null default '',
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  created_at timestamptz not null default now()
);
alter table public.category_suggestions enable row level security;
drop policy if exists sugg_read on public.category_suggestions;
create policy sugg_read on public.category_suggestions for select using (status = 'APPROVED' or user_id = auth.uid() or public.is_admin());
drop policy if exists sugg_insert on public.category_suggestions;
create policy sugg_insert on public.category_suggestions for insert to authenticated
  with check (user_id = auth.uid() and (status = 'PENDING' or public.is_admin()));
drop policy if exists sugg_update on public.category_suggestions;
create policy sugg_update on public.category_suggestions for update to authenticated using (public.is_admin());

-- 3) Kelengkapan profil: foto 20, nama+bio 15, domisili 20, WhatsApp 20, email 15, sosial 10
create or replace function public.profile_pct(uid uuid) returns int
language sql security definer stable set search_path = public as $$
  select coalesce((select
      (case when p.avatar_url <> '' then 20 else 0 end)
    + (case when p.full_name <> '' and char_length(p.bio) >= 10 then 15 else 0 end)
    + (case when p.province <> '' and p.city <> '' and p.district <> '' then 20 else 0 end)
    + (case when p.wa_verified then 20 else 0 end)
    + (case when coalesce(c.email, '') ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then 15 else 0 end)
    + (case when p.social_url ~* '^https?://.+\..+' then 10 else 0 end)
    from public.profiles p left join public.contacts c on c.id = p.id where p.id = uid), 0)
$$;

-- Wajib: foto, domisili, WhatsApp terkonfirmasi, email  + skor >= 80 + akun ACTIVE
create or replace function public.profile_ok(uid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select
      p.status = 'ACTIVE' and p.avatar_url <> ''
      and p.province <> '' and p.city <> '' and p.district <> ''
      and p.wa_verified
      and coalesce(c.email, '') ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
      and public.profile_pct(uid) >= 80
    from public.profiles p left join public.contacts c on c.id = p.id where p.id = uid), false)
$$;

-- 4) Pendaftar baru otomatis dibuatkan profil + kontak (termasuk email)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''))
  on conflict do nothing;
  insert into public.contacts (id, email) values (new.id, coalesce(new.email, '')) on conflict do nothing;
  return new;
end $$;

-- 5) Perbaikan ikon Profil: pengguna lama yang belum punya baris profil dibuatkan sekarang
insert into public.profiles (id, full_name)
  select id, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '') from auth.users
  on conflict do nothing;
insert into public.contacts (id, email) select id, coalesce(email, '') from auth.users on conflict (id) do nothing;
update public.contacts c set email = u.email from auth.users u where u.id = c.id and c.email = '';

-- Izin membuat profil sendiri (cadangan bila trigger belum aktif)
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid() and not is_admin and status = 'ACTIVE' and completed_orders = 0 and rating_sum = 0 and rating_count = 0);

-- 6) Gerbang data wajib diterapkan di database untuk semua konten baru
drop policy if exists services_insert on public.services;
create policy services_insert on public.services for insert to authenticated
  with check (provider_id = auth.uid() and public.profile_ok(auth.uid()));
drop policy if exists bids_insert on public.bids;
create policy bids_insert on public.bids for insert to authenticated
  with check (provider_id = auth.uid() and public.profile_ok(auth.uid())
              and not exists (select 1 from public.requests r where r.id = request_id and r.buyer_id = auth.uid()));
drop policy if exists requests_insert on public.requests;
create policy requests_insert on public.requests for insert to authenticated
  with check (buyer_id = auth.uid() and public.profile_ok(auth.uid()));
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert to authenticated
  with check (buyer_id = auth.uid() and public.profile_ok(auth.uid()));
