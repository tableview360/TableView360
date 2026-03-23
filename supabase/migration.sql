-- ============================================
-- TableView360 - Database Migration
-- ============================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null default 'client' check (role in ('admin', 'restaurant', 'client')),
  full_name text,
  username text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Restaurants table
create table if not exists public.restaurants (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  description text,
  address text,
  city text,
  capacity int,
  cover_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Restaurant photos table
create table if not exists public.restaurant_photos (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 4. Reservations table
create table if not exists public.reservations (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  client_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  time time not null,
  guests int not null default 1,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- Indexes
-- ============================================
create index if not exists idx_restaurants_owner on public.restaurants(owner_id);
create index if not exists idx_restaurant_photos_restaurant on public.restaurant_photos(restaurant_id);
create index if not exists idx_reservations_restaurant on public.reservations(restaurant_id);
create index if not exists idx_reservations_client on public.reservations(client_id);
create index if not exists idx_reservations_date on public.reservations(date);

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Trigger: auto-create restaurant for restaurant owners
-- ============================================
create or replace function public.handle_new_restaurant_owner()
returns trigger as $$
begin
  if new.role = 'restaurant' then
    insert into public.restaurants (owner_id, name, email)
    values (new.id, 'Mi Restaurante', '');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_restaurant_owner();

-- ============================================
-- Trigger: auto-update updated_at on restaurants
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.restaurants;
create trigger set_updated_at
  before update on public.restaurants
  for each row execute function public.handle_updated_at();

-- ============================================
-- RLS: Enable on all tables
-- ============================================
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_photos enable row level security;
alter table public.reservations enable row level security;

-- ============================================
-- Helper: check if user is admin
-- ============================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- ============================================
-- RLS Policies: profiles
-- ============================================
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admin can update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "Admin can delete profiles"
  on public.profiles for delete
  using (public.is_admin());

-- ============================================
-- RLS Policies: restaurants
-- ============================================
create policy "Authenticated users can read restaurants"
  on public.restaurants for select
  using (auth.uid() is not null);

create policy "Owner can update own restaurant"
  on public.restaurants for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Admin can do anything with restaurants"
  on public.restaurants for all
  using (public.is_admin());

-- ============================================
-- RLS Policies: restaurant_photos
-- ============================================
create policy "Authenticated users can view photos"
  on public.restaurant_photos for select
  using (auth.uid() is not null);

create policy "Owner can manage own restaurant photos"
  on public.restaurant_photos for all
  using (
    exists (
      select 1 from public.restaurants
      where id = restaurant_photos.restaurant_id
      and owner_id = auth.uid()
    )
  );

create policy "Admin can manage all photos"
  on public.restaurant_photos for all
  using (public.is_admin());

-- ============================================
-- RLS Policies: reservations
-- ============================================
create policy "Client can read own reservations"
  on public.reservations for select
  using (auth.uid() = client_id);

create policy "Client can create reservations"
  on public.reservations for insert
  with check (auth.uid() = client_id);

create policy "Client can cancel own reservations"
  on public.reservations for update
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "Restaurant owner can read their reservations"
  on public.reservations for select
  using (
    exists (
      select 1 from public.restaurants
      where id = reservations.restaurant_id
      and owner_id = auth.uid()
    )
  );

create policy "Restaurant owner can update their reservations"
  on public.reservations for update
  using (
    exists (
      select 1 from public.restaurants
      where id = reservations.restaurant_id
      and owner_id = auth.uid()
    )
  );

create policy "Admin can manage all reservations"
  on public.reservations for all
  using (public.is_admin());

-- ============================================
-- Storage: restaurant photos bucket
-- ============================================
insert into storage.buckets (id, name, public)
values ('restaurant-photos', 'restaurant-photos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view restaurant photos"
  on storage.objects for select
  using (bucket_id = 'restaurant-photos');

create policy "Restaurant owner can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'restaurant-photos'
    and auth.uid() is not null
    and (
      public.is_admin()
      or exists (
        select 1 from public.restaurants
        where owner_id = auth.uid()
        and id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "Restaurant owner can delete photos"
  on storage.objects for delete
  using (
    bucket_id = 'restaurant-photos'
    and auth.uid() is not null
    and (
      public.is_admin()
      or exists (
        select 1 from public.restaurants
        where owner_id = auth.uid()
        and id::text = (storage.foldername(name))[1]
      )
    )
  );
