-- ===============================
-- EXTENSIONS
-- ===============================

-- ===============================
-- PROFILES (todos los usuarios)
-- ===============================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('client','restaurant')) not null,
  full_name text,
  email text,
  phone text,
  phone_verified boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Usuarios pueden ver su propio perfil
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Usuarios pueden insertar su perfil al registrarse
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- Usuarios pueden actualizar su perfil
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- ===============================
-- RESTAURANT_PROFILES (solo info extra restaurantes)
-- ===============================
create table public.restaurant_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  country text,
  city text,
  street text,
  number text,
  postal_code text,
  created_at timestamp with time zone default now()
);

alter table public.restaurant_profiles enable row level security;

create policy "Restaurant owner manages own restaurant profile"
on public.restaurant_profiles
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id
    and p.role = 'restaurant'
    and p.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id
    and p.role = 'restaurant'
    and p.id = auth.uid()
  )
);

-- ===============================
-- RESTAURANTS
-- ===============================
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  phone text,
  email text,
  address text,
  logo_url text,
  created_at timestamp with time zone default now()
);

alter table public.restaurants enable row level security;

-- Cualquiera puede ver restaurantes (para buscar y reservar)
create policy "Anyone can view restaurants"
on public.restaurants
for select
using (true);

-- Solo el owner puede crear/editar/eliminar su restaurante
create policy "Owner manages own restaurant"
on public.restaurants
for insert
with check (auth.uid() = owner_id);

create policy "Owner updates own restaurant"
on public.restaurants
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owner deletes own restaurant"
on public.restaurants
for delete
using (auth.uid() = owner_id);

-- ===============================
-- RESTAURANT SETTINGS
-- ===============================
create table public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  primary_color text,
  secondary_color text,
  booking_interval integer default 30,
  max_tables integer default 20
);

alter table public.restaurant_settings enable row level security;

create policy "Restaurant owner manages settings"
on public.restaurant_settings
for all
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
    and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
    and r.owner_id = auth.uid()
  )
);

-- ===============================
-- TABLES (2D / 3D layout)
-- ===============================
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  name text,
  capacity integer not null,
  position_x integer,
  position_y integer,
  shape text check (shape in ('round','square')) default 'round'
);

alter table public.tables enable row level security;

-- Cualquiera puede ver las mesas (para hacer reservas)
create policy "Anyone can view tables"
on public.tables
for select
using (true);

-- Solo el owner del restaurante puede gestionar mesas
create policy "Restaurant owner manages tables"
on public.tables
for insert
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
    and r.owner_id = auth.uid()
  )
);

create policy "Restaurant owner updates tables"
on public.tables
for update
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
    and r.owner_id = auth.uid()
  )
);

create policy "Restaurant owner deletes tables"
on public.tables
for delete
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
    and r.owner_id = auth.uid()
  )
);

-- ===============================
-- RESERVATIONS
-- ===============================
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete cascade,
  table_id uuid references public.tables(id) on delete set null,
  reservation_date timestamp with time zone not null,
  people integer not null,
  status text check (status in ('pending','confirmed','cancelled')) default 'pending',
  created_at timestamp with time zone default now()
);

alter table public.reservations enable row level security;

-- Cliente puede ver sus reservas
create policy "Client views own reservations"
on public.reservations
for select
using (auth.uid() = client_id);

-- Cliente puede crear reservas
create policy "Client creates reservations"
on public.reservations
for insert
with check (auth.uid() = client_id);

-- Cliente puede cancelar sus reservas
create policy "Client cancels own reservations"
on public.reservations
for update
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

-- Restaurant owner ve reservas de su restaurante
create policy "Owner views restaurant reservations"
on public.reservations
for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
    and r.owner_id = auth.uid()
  )
);

-- Restaurant owner puede actualizar reservas (confirmar/cancelar)
create policy "Owner manages restaurant reservations"
on public.reservations
for update
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
    and r.owner_id = auth.uid()
  )
);
