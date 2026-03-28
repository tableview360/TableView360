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

drop policy if exists "restaurant_tables_select" on public.restaurant_tables;
create policy "restaurant_tables_select"
on public.restaurant_tables
for select
to authenticated
using (true);
