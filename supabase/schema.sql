-- =====================================================================
-- JasaKita - Skema Supabase (PostgreSQL + Auth + Storage + RLS)
-- Cara pakai: Supabase Dashboard > SQL Editor > New query > tempel semua > Run
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- TABEL ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  province text not null default '', city text not null default '', district text not null default '',
  social_url text not null default '',
  wa_verified boolean not null default false,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED')),
  is_admin boolean not null default false,
  completed_orders int not null default 0,
  rating_sum int not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Nomor WhatsApp dipisah dari profil publik: hanya pengguna yang LOGIN bisa membacanya
create table if not exists public.contacts (
  id uuid primary key references public.profiles(id) on delete cascade,
  whatsapp text not null default ''
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  category text not null, subcategory text not null default '',
  title text not null check (char_length(title) between 8 and 120),
  description text not null check (char_length(description) >= 30),
  price_hourly bigint check (price_hourly > 0), price_daily bigint check (price_daily > 0), price_project bigint check (price_project > 0),
  warranty_days int not null default 0 check (warranty_days between 0 and 365),
  warranty_desc text not null check (char_length(warranty_desc) >= 10),
  mode text not null check (mode in ('ONSITE','REMOTE','BOTH')),
  province text not null default '', city text not null default '', district text not null default '',
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (price_hourly is not null or price_daily is not null or price_project is not null)
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, description text not null, category text not null,
  mode text not null check (mode in ('ONSITE','REMOTE','BOTH')),
  province text not null default '', city text not null default '', district text not null default '',
  pricing_model text not null check (pricing_model in ('HOURLY','DAILY','PROJECT')),
  budget bigint not null check (budget > 0),
  status text not null default 'OPEN' check (status in ('OPEN','CLOSED')),
  created_at timestamptz not null default now()
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  pricing_model text not null check (pricing_model in ('HOURLY','DAILY','PROJECT')),
  price bigint not null check (price > 0),
  duration text not null default '',
  warranty_days int not null default 0, warranty_desc text not null check (char_length(warranty_desc) >= 10),
  note text not null default '',
  status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED')),
  created_at timestamptz not null default now(),
  unique (request_id, provider_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  service_id uuid references public.services(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  pricing_model text not null check (pricing_model in ('HOURLY','DAILY','PROJECT')),
  agreed_price bigint not null check (agreed_price > 0),
  dp_percent int not null default 0 check (dp_percent between 0 and 100),
  payment_terms text not null, scope text not null,
  warranty_days int not null default 0, warranty_desc text not null,
  status text not null default 'AGREEMENT' check (status in ('AGREEMENT','IN_PROGRESS','DONE_WARRANTY','CLAIM','CLOSED')),
  buyer_ok boolean not null default false, provider_ok boolean not null default false,
  done_at timestamptz, warranty_ends_at timestamptz,
  claim_note text not null default '',
  rating int check (rating between 1 and 5), review text not null default '',
  created_at timestamptz not null default now(),
  check (buyer_id <> provider_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null, evidence text not null check (char_length(evidence) >= 15),
  status text not null default 'PENDING' check (status in ('PENDING','VALID','REJECTED')),
  created_at timestamptz not null default now(),
  unique (reporter_id, target_id)
);

create table if not exists public.mod_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('service','request')),
  title text not null,
  verdict text not null check (verdict in ('APPROVED','REJECTED')),
  reason text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- INDEKS ----------
create index if not exists idx_services_category on public.services(category);
create index if not exists idx_services_loc on public.services(province, city, district);
create index if not exists idx_services_active on public.services(is_active, created_at desc);
create index if not exists idx_services_provider on public.services(provider_id);
create index if not exists idx_requests_status on public.requests(status, created_at desc);
create index if not exists idx_bids_request on public.bids(request_id);
create index if not exists idx_orders_buyer on public.orders(buyer_id);
create index if not exists idx_orders_provider on public.orders(provider_id);
create index if not exists idx_reports_target on public.reports(target_id, status);

-- ---------- FUNGSI BANTU ----------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- Kelengkapan profil (0-100): foto, nama+bio, domisili, WA terkonfirmasi, link sosial
create or replace function public.profile_pct(uid uuid) returns int
language sql security definer stable set search_path = public as $$
  select coalesce((select
      (case when avatar_url <> '' then 20 else 0 end)
    + (case when full_name <> '' and char_length(bio) >= 10 then 20 else 0 end)
    + (case when province <> '' and city <> '' and district <> '' then 20 else 0 end)
    + (case when wa_verified then 20 else 0 end)
    + (case when social_url ~* '^https?://.+\..+' then 20 else 0 end)
    from public.profiles where id = uid), 0)
$$;

-- ---------- TRIGGER ----------
-- 1) Profil otomatis dibuat saat user mendaftar (email atau Google)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''))
  on conflict do nothing;
  insert into public.contacts (id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- 2) Pengguna biasa tidak boleh mengubah status/admin/statistik miliknya sendiri
create or replace function public.protect_profile() returns trigger
language plpgsql as $$
begin
  if coalesce(current_setting('jk.bypass', true), '') = '1' or public.is_admin() or auth.uid() is null then
    return new;
  end if;
  new.is_admin := old.is_admin; new.status := old.status;
  new.completed_orders := old.completed_orders; new.rating_sum := old.rating_sum;
  new.rating_count := old.rating_count; new.created_at := old.created_at;
  return new;
end $$;
drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile before update on public.profiles for each row execute function public.protect_profile();

-- 3) Pesanan ditutup => statistik & rating penyedia diperbarui
create or replace function public.on_order_closed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'CLOSED' and old.status <> 'CLOSED' then
    perform set_config('jk.bypass', '1', true);
    update public.profiles set
      completed_orders = completed_orders + 1,
      rating_sum = rating_sum + coalesce(new.rating, 0),
      rating_count = rating_count + (case when new.rating is not null then 1 else 0 end)
    where id = new.provider_id;
    perform set_config('jk.bypass', '', true);
  end if;
  return new;
end $$;
drop trigger if exists trg_order_closed on public.orders;
create trigger trg_order_closed after update on public.orders for each row execute function public.on_order_closed();

-- 4) >= 3 laporan VALID => akun SUSPENDED + semua listing disembunyikan
create or replace function public.on_report_validated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'VALID' and old.status <> 'VALID'
     and (select count(*) from public.reports where target_id = new.target_id and status = 'VALID') >= 3 then
    perform set_config('jk.bypass', '1', true);
    update public.profiles set status = 'SUSPENDED' where id = new.target_id;
    update public.services set is_active = false where provider_id = new.target_id;
    perform set_config('jk.bypass', '', true);
  end if;
  return new;
end $$;
drop trigger if exists trg_report_validated on public.reports;
create trigger trg_report_validated after update on public.reports for each row execute function public.on_report_validated();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.services enable row level security;
alter table public.requests enable row level security;
alter table public.bids enable row level security;
alter table public.orders enable row level security;
alter table public.reports enable row level security;
alter table public.mod_logs enable row level security;

-- profiles: publik bisa baca (tanpa nomor WA); hanya pemilik/admin yang mengubah
create policy profiles_read on public.profiles for select using (true);
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin());

-- contacts: HANYA user login yang bisa baca; pemilik yang menulis
create policy contacts_read on public.contacts for select to authenticated using (true);
create policy contacts_insert on public.contacts for insert to authenticated with check (id = auth.uid());
create policy contacts_update on public.contacts for update to authenticated using (id = auth.uid());

-- services: tayang bila aktif; menerbitkan butuh profil >= 80% & akun ACTIVE
create policy services_read on public.services for select using (is_active or provider_id = auth.uid() or public.is_admin());
create policy services_insert on public.services for insert to authenticated
  with check (provider_id = auth.uid() and public.profile_pct(auth.uid()) >= 80
              and exists (select 1 from public.profiles where id = auth.uid() and status = 'ACTIVE'));
create policy services_update on public.services for update to authenticated using (provider_id = auth.uid() or public.is_admin());
create policy services_delete on public.services for delete to authenticated using (provider_id = auth.uid() or public.is_admin());

-- requests
create policy requests_read on public.requests for select using (true);
create policy requests_insert on public.requests for insert to authenticated
  with check (buyer_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and status = 'ACTIVE'));
create policy requests_update on public.requests for update to authenticated using (buyer_id = auth.uid() or public.is_admin());

-- bids: mengirim penawaran butuh profil >= 80%
create policy bids_read on public.bids for select to authenticated
  using (provider_id = auth.uid() or public.is_admin() or exists (select 1 from public.requests r where r.id = request_id and r.buyer_id = auth.uid()));
create policy bids_insert on public.bids for insert to authenticated
  with check (provider_id = auth.uid() and public.profile_pct(auth.uid()) >= 80
              and not exists (select 1 from public.requests r where r.id = request_id and r.buyer_id = auth.uid()));
create policy bids_update on public.bids for update to authenticated
  using (provider_id = auth.uid() or public.is_admin() or exists (select 1 from public.requests r where r.id = request_id and r.buyer_id = auth.uid()));

-- orders: hanya pembeli/penyedia terkait (dan admin)
create policy orders_read on public.orders for select to authenticated using (buyer_id = auth.uid() or provider_id = auth.uid() or public.is_admin());
create policy orders_insert on public.orders for insert to authenticated with check (buyer_id = auth.uid());
create policy orders_update on public.orders for update to authenticated using (buyer_id = auth.uid() or provider_id = auth.uid() or public.is_admin());

-- reports: pelapor menulis & melihat laporannya; admin melihat semua dan memutuskan
create policy reports_insert on public.reports for insert to authenticated with check (reporter_id = auth.uid() and target_id <> auth.uid());
create policy reports_read on public.reports for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
create policy reports_update on public.reports for update to authenticated using (public.is_admin());

-- mod_logs: user mencatat log miliknya; hanya admin yang membaca
create policy modlogs_insert on public.mod_logs for insert to authenticated with check (user_id = auth.uid());
create policy modlogs_read on public.mod_logs for select to authenticated using (public.is_admin());

-- ---------- STORAGE (foto profil) ----------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- =============== BAGIAN PEMBARUAN v2 (kategori 3 tingkat, data wajib) ===============

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

-- ---------- JADIKAN DIRIMU ADMIN (jalankan SETELAH kamu daftar di aplikasi) ----------
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = 'EMAIL_KAMU@gmail.com');
