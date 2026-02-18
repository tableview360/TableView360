alter table public.contacts enable row level security;

drop policy if exists "Anyone can insert contacts" on public.contacts;
create policy "Anyone can insert contacts"
on public.contacts
for insert
to anon, authenticated
with check (true);

-- Opcional: solo staff/service puede leer contactos
drop policy if exists "Only service role can read contacts" on public.contacts;
create policy "Only service role can read contacts"
on public.contacts
for select
to authenticated
using (false);
