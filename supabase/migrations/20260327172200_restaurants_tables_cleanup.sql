create table if not exists public.restaurants_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  capacity integer not null check (capacity > 0),
  chairs integer not null default 4 check (chairs > 0),
  x_position double precision not null default 0,
  y_position double precision not null default 0,
  created_at timestamptz not null default now()
);

alter table public.restaurants_tables
add column if not exists x_position double precision not null default 0;

alter table public.restaurants_tables
add column if not exists y_position double precision not null default 0;

alter table public.restaurants_tables
add column if not exists chairs integer;

update public.restaurants_tables
set chairs = capacity
where chairs is null;

alter table public.restaurants_tables
alter column chairs set default 4;

alter table public.restaurants_tables
alter column chairs set not null;

create index if not exists idx_restaurants_tables_restaurant_id
  on public.restaurants_tables(restaurant_id);

do $$
begin
  if to_regclass('public.restaurant_tables') is not null then
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

    insert into public.restaurants_tables (
      id,
      restaurant_id,
      name,
      capacity,
      chairs,
      x_position,
      y_position,
      created_at
    )
    select
      rt.id,
      rt.restaurant_id,
      rt.name,
      rt.capacity,
      coalesce(rt.chairs, rt.capacity, 4),
      coalesce(rt.x_position, 0),
      coalesce(rt.y_position, 0),
      coalesce(rt.created_at, now())
    from public.restaurant_tables rt
    on conflict (id) do nothing;
  end if;
end $$;

alter table public.reservations
add column if not exists table_id uuid;

do $$
declare fk_name text;
begin
  if to_regclass('public.reservations') is null then
    return;
  end if;

  for fk_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.reservations'::regclass
      and c.contype = 'f'
      and exists (
        select 1
        from unnest(c.conkey) as k(attnum)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = k.attnum
        where a.attname = 'table_id'
      )
  loop
    execute format(
      'alter table public.reservations drop constraint if exists %I',
      fk_name
    );
  end loop;
end $$;

do $$
begin
  if to_regclass('public.reservations') is null then
    return;
  end if;
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.reservations'::regclass
      and conname = 'reservations_table_id_fkey'
  ) then
    alter table public.reservations
    add constraint reservations_table_id_fkey
    foreign key (table_id)
    references public.restaurants_tables(id)
    on delete set null;
  end if;
end $$;

create index if not exists idx_reservations_table_id
  on public.reservations(table_id);

alter table public.restaurants_tables enable row level security;

drop policy if exists "restaurant_tables_select" on public.restaurants_tables;
drop policy if exists "restaurants_tables_select" on public.restaurants_tables;
create policy "restaurants_tables_select"
on public.restaurants_tables
for select
to authenticated
using (true);

drop policy if exists "restaurant_tables_insert" on public.restaurants_tables;
drop policy if exists "restaurants_tables_insert" on public.restaurants_tables;
create policy "restaurants_tables_insert"
on public.restaurants_tables
for insert
to authenticated
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurants_tables.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "restaurant_tables_update" on public.restaurants_tables;
drop policy if exists "restaurants_tables_update" on public.restaurants_tables;
create policy "restaurants_tables_update"
on public.restaurants_tables
for update
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurants_tables.restaurant_id
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
    where r.id = restaurants_tables.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "restaurant_tables_delete" on public.restaurants_tables;
drop policy if exists "restaurants_tables_delete" on public.restaurants_tables;
create policy "restaurants_tables_delete"
on public.restaurants_tables
for delete
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurants_tables.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop table if exists public.restaurant_tables;
