# TableView360
Aplicación Astro + React + Supabase para subir fotos de un restaurante/habitación y generar un `model.glb` automáticamente mediante fotogrametría real.

## Qué hace ahora
- Subes hasta 10 fotos desde la página de detalle del restaurante.
- Las fotos se guardan en Supabase Storage: `restaurant-uploads/{slug}/originals/*`.
- El endpoint `POST /api/restaurants/process-model` ejecuta pipeline local:
  - COLMAP (features + matching + sparse + undistort)
  - OpenMVS (dense + mesh + texture)
  - Blender (export final a GLB)
- El resultado se sube a:
  - `restaurant-models/{slug}/model.glb`
- La página del restaurante detecta el `model.glb` y lo renderiza en Three.js.

## Requisitos
### 1) Node
- Node 18+ recomendado

### 2) Variables de entorno
En `.env`:

```bash
PUBLIC_SUPABASE_URL=https://<tu-project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
```

`SUPABASE_SERVICE_ROLE_KEY` se obtiene en:
Supabase Dashboard → Settings → API → Project API keys → `service_role`.

### 3) Supabase Storage
Crear buckets:
- `restaurant-uploads` (privado)
- `restaurant-models` (público)

### 4) RLS / políticas para storage.objects
Ejecuta en SQL Editor:

```sql
insert into storage.buckets (id, name, public)
values ('restaurant-uploads', 'restaurant-uploads', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('restaurant-models', 'restaurant-models', true)
on conflict (id) do nothing;

drop policy if exists "restaurant-uploads insert anon/auth" on storage.objects;
drop policy if exists "restaurant-uploads read anon/auth" on storage.objects;
drop policy if exists "restaurant-models public read" on storage.objects;
drop policy if exists "restaurant-models service write" on storage.objects;

create policy "restaurant-uploads insert anon/auth"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'restaurant-uploads');

create policy "restaurant-uploads read anon/auth"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'restaurant-uploads');

create policy "restaurant-models public read"
on storage.objects
for select
to public
using (bucket_id = 'restaurant-models');

create policy "restaurant-models service write"
on storage.objects
for all
to service_role
using (bucket_id = 'restaurant-models')
with check (bucket_id = 'restaurant-models');
```

## Instalación de fotogrametría (Mac)
Requiere Homebrew:

```bash
brew install colmap
brew install --cask blender
```

Este proyecto ya está adaptado a COLMAP 3.13 (Homebrew actual) usando:
- `--FeatureExtraction.use_gpu`
- `--FeatureMatching.use_gpu`
No usa las flags antiguas `--SiftExtraction.use_gpu`/`--SiftMatching.use_gpu`.

Verifica:

```bash
which colmap
which InterfaceCOLMAP
which DensifyPointCloud
which ReconstructMesh
which TextureMesh
which blender
```

Si no tienes OpenMVS instalado, el endpoint usa modo fallback denso:
- COLMAP + Blender
- exporta GLB desde nube de puntos sparse (`model_converter` a PLY)
- funciona, pero con menor calidad que OpenMVS texturizado
- en equipos con 8GB RAM, el pipeline fuerza modo conservador:
  - `FeatureExtraction.num_threads=1`
  - `FeatureMatching.num_threads=1`
  - `SiftExtraction.max_image_size=1600`
  - `SiftExtraction.max_num_features=4096`
- si `patch_match_stereo` falla por CUDA (`Dense stereo reconstruction requires CUDA`),
  el sistema hace fallback automático a malla desde nube sparse de COLMAP.

## Flujo funcional actual
1. `npm install`
2. `npm run dev`
3. Abrir restaurante (`/#/restaurant/<slug>` por HashRouter)
4. Subir fotos (ideal: 10–40, bien solapadas, buena luz)
5. Esperar el procesamiento del endpoint:
   - `POST /api/restaurants/process-model`
6. Ver modelo en pantalla.

## Endpoint principal
### `POST /api/restaurants/process-model`
Dispara reconstrucción real de `model.glb` para un slug.

Body recomendado:

```json
{ "slug": "bistro-central" }
```

Respuesta exitosa:
- `success: true`
- `modelUrl`
- `photosCount`

## Comandos útiles de diagnóstico
### Probar proceso manual
```bash
curl -i -X POST "http://localhost:4326/api/restaurants/process-model" \
  -H "Content-Type: application/json" \
  -d '{"slug":"bistro-central"}'
```

### Ver si el GLB está disponible públicamente
```bash
curl -i "https://<project-ref>.supabase.co/storage/v1/object/public/restaurant-models/bistro-central/model.glb"
```

## Problemas comunes
- `new row violates row-level security policy`
  - faltan/están mal las políticas de `storage.objects`.
- `Object not found`
  - todavía no se generó/subió `restaurant-models/{slug}/model.glb`.
- `No se encontró "colmap"` (u otro binario)
  - falta instalar herramientas o no están en PATH.
- faltan binarios OpenMVS (`InterfaceCOLMAP`, `ReconstructMesh`, etc.)
  - se usará fallback COLMAP+Blender (calidad menor), no bloquea el flujo.
- `unrecognised option '--SiftExtraction.use_gpu'`
  - indica script viejo para COLMAP; en este repo ya está corregido a `FeatureExtraction/FeatureMatching`.
- reconstrucción pobre/sin detalle
  - pocas fotos, poca superposición, blur o poca textura visual.

## Reutilizar en otro proyecto
Para portar este flujo:
1. Copiar endpoint `src/pages/api/restaurants/process-model.ts`
2. Copiar utilidad `src/lib/photogrammetryPipeline.ts`
3. Replicar buckets/policies/env
4. Adaptar nombres de rutas y `slug`
5. Mantener estructura de entrada:
   - `restaurant-uploads/{slug}/originals/*`
6. Mantener salida:
   - `restaurant-models/{slug}/model.glb`

Con eso puedes reutilizar el pipeline en otra app Astro/Node con Supabase.
