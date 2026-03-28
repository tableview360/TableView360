alter table public.restaurants
add column if not exists city text;

create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  capacity integer not null check (capacity > 0),
  chairs integer not null default 4 check (chairs > 0),
  x_position double precision not null default 0,
  y_position double precision not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_restaurant_tables_restaurant_id
  on public.restaurant_tables(restaurant_id);

alter table public.restaurant_tables
add column if not exists x_position double precision not null default 0;

alter table public.restaurant_tables
add column if not exists y_position double precision not null default 0;

alter table public.restaurant_tables
add column if not exists chairs integer;

update public.restaurant_tables
set chairs = capacity
where chairs is null;

alter table public.restaurant_tables
alter column chairs set default 4;

alter table public.restaurant_tables
alter column chairs set not null;

alter table public.reservations
add column if not exists table_id uuid references public.restaurant_tables(id) on delete set null;

create index if not exists idx_reservations_table_id
  on public.reservations(table_id);

alter table public.restaurant_tables enable row level security;

drop policy if exists "restaurant_tables_select" on public.restaurant_tables;
create policy "restaurant_tables_select"
on public.restaurant_tables
for select
to authenticated
using (true);

drop policy if exists "restaurant_tables_insert" on public.restaurant_tables;
create policy "restaurant_tables_insert"
on public.restaurant_tables
for insert
to authenticated
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_tables.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "restaurant_tables_update" on public.restaurant_tables;
create policy "restaurant_tables_update"
on public.restaurant_tables
for update
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_tables.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_tables.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "restaurant_tables_delete" on public.restaurant_tables;
create policy "restaurant_tables_delete"
on public.restaurant_tables
for delete
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_tables.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
