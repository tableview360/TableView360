alter table public.tables
  add column if not exists seats integer;

update public.tables
set seats = capacity
where seats is null;

alter table public.reservations
  add column if not exists date date,
  add column if not exists time time;

update public.reservations
set
  date = reservation_date::date,
  time = reservation_date::time
where date is null or time is null;

create unique index if not exists reservations_table_date_time_unique
  on public.reservations (table_id, date, time)
  where status <> 'cancelled' and date is not null and time is not null;
