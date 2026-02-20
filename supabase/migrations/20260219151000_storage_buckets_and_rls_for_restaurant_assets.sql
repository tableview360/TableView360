-- Buckets para fotos fuente y modelos GLB
insert into storage.buckets (id, name, public)
values ('restaurant-uploads', 'restaurant-uploads', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('restaurant-models', 'restaurant-models', true)
on conflict (id) do nothing;

-- Limpia políticas previas para evitar duplicados al re-ejecutar migración
drop policy if exists "restaurant-uploads insert anon/auth" on storage.objects;
drop policy if exists "restaurant-uploads read own bucket" on storage.objects;
drop policy if exists "restaurant-models public read" on storage.objects;
drop policy if exists "restaurant-models service write" on storage.objects;

-- Permite subir fotos (desde API o cliente autenticado) al bucket de uploads
create policy "restaurant-uploads insert anon/auth"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'restaurant-uploads');

-- Permite lectura de fotos del bucket de uploads (útil para debug interno)
create policy "restaurant-uploads read own bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'restaurant-uploads');

-- Permite lectura pública de modelos GLB
create policy "restaurant-models public read"
on storage.objects
for select
to public
using (bucket_id = 'restaurant-models');

-- Permite escritura de modelos desde backend con service role
create policy "restaurant-models service write"
on storage.objects
for all
to service_role
using (bucket_id = 'restaurant-models')
with check (bucket_id = 'restaurant-models');
