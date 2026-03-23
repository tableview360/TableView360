# ◈ TableView360

CMS y sistema de reservas para restaurantes con roles de usuario, panel de administración, dashboard para restaurantes y sistema de reservas para clientes.

## Tech Stack

- **Astro 5** — Framework SSR
- **React 19** — Componentes interactivos (islands)
- **Tailwind CSS 4** — Estilos (tema oscuro slate/violet)
- **Supabase** — Auth, PostgreSQL, Storage, RLS
- **TypeScript** — Tipado estricto

Todo gratuito (Supabase Free Tier).

## Estructura del Proyecto

```
src/
├── components/
│   ├── Navbar.tsx              # Navbar responsivo + selector idioma + mobile menu
│   ├── LoginForm.tsx           # Formulario de login
│   ├── LoginModal.tsx          # Modal de login para no logueados
│   ├── RegisterForm.tsx        # Registro con campos por rol
│   ├── ReservationForm.tsx     # Formulario de reserva (cliente)
│   ├── RestaurantCard.tsx      # Card de restaurante
│   ├── cms/
│   │   ├── CmsRestaurants.tsx  # CRUD restaurantes (admin)
│   │   ├── CmsClients.tsx      # Lista usuarios (admin)
│   │   └── CmsReservations.tsx # Gestión reservas (admin)
│   └── dashboard/
│       ├── RestaurantEditor.tsx # Editar restaurante + subir fotos
│       └── DashboardReservations.tsx # Reservas del restaurante
├── layouts/
│   ├── Layout.astro            # Layout base (dark theme)
│   ├── CmsLayout.astro         # Layout CMS con sidebar
│   └── DashboardLayout.astro   # Layout dashboard restaurante
├── lib/
│   ├── i18n.ts                 # Sistema de traducciones EN/ES
│   └── supabase.ts             # Clientes Supabase (server + browser)
├── middleware.ts               # Auth + i18n (/es/ prefix) + protección rutas
├── pages/
│   ├── index.astro             # Landing page
│   ├── login.astro             # Página de login
│   ├── registro.astro          # Página de registro
│   ├── restaurantes/
│   │   ├── index.astro         # Lista de restaurantes
│   │   └── [id].astro          # Detalle + reservar
│   ├── cms/
│   │   ├── index.astro         # Dashboard admin (stats)
│   │   ├── restaurantes.astro  # CRUD restaurantes
│   │   ├── clientes.astro      # Lista usuarios
│   │   └── reservas.astro      # Gestión reservas
│   ├── dashboard/
│   │   ├── index.astro         # Panel restaurante (stats)
│   │   ├── mi-restaurante.astro# Editar restaurante + fotos
│   │   └── reservas.astro      # Reservas del restaurante
│   └── api/auth/
│       ├── login.ts            # POST /api/auth/login
│       ├── register.ts         # POST /api/auth/register
│       └── logout.ts           # POST /api/auth/logout
└── styles/
    └── global.css              # Tailwind + Inter font + tema

supabase/
├── migration.sql               # Tablas, RLS, triggers, storage
├── seed.mjs                    # Script Node.js para crear usuarios de prueba
└── seed.sql                    # (alternativo) Seed SQL directo
```

## Roles y Rutas

### Admin

- **Acceso**: `/cms`, `/cms/restaurantes`, `/cms/clientes`, `/cms/reservas`
- **Puede**: Ver stats, CRUD de todos los restaurantes, ver todos los clientes, gestionar todas las reservas (confirmar, cancelar, eliminar)

### Restaurante (owner)

- **Acceso**: `/dashboard`, `/dashboard/mi-restaurante`, `/dashboard/reservas`
- **Puede**: Ver stats de su restaurante, editar nombre/email/teléfono/dirección/descripción, subir y eliminar fotos, ver y gestionar reservas de su restaurante
- **No puede**: Acceder al CMS, modificar otros restaurantes

### Cliente

- **Acceso**: `/restaurantes`, `/restaurantes/[id]`
- **Puede**: Ver restaurantes, ver detalle con fotos, hacer reservas
- **No puede**: Acceder al CMS ni al dashboard de restaurante

### No logueado

- **Acceso**: `/`, `/login`, `/registro`
- **No puede**: Ver restaurantes — se redirige a `/` con modal de login

## i18n (Idiomas)

- **Inglés** (default): `/`, `/login`, `/restaurantes`
- **Español**: `/es/`, `/es/login`, `/es/restaurantes`
- Selector de idioma en el Navbar (desktop dropdown + mobile)
- El middleware detecta el prefijo `/es/` y establece el idioma en el servidor

## Base de Datos

### Tablas

- **profiles** — Extiende auth.users: role, full_name, username, phone
- **restaurants** — name, email, phone, description, address, city, capacity, cover_image
- **restaurant_photos** — url, caption, sort_order (Storage: bucket `restaurant-photos`)
- **reservations** — date, time, guests, status (pending/confirmed/cancelled), notes

### RLS (Row Level Security)

- Profiles: lectura propia + admin lee todos
- Restaurants: lectura para autenticados, escritura owner + admin
- Photos: lectura para autenticados, escritura owner del restaurante + admin
- Reservations: cliente ve/crea las suyas, restaurant owner ve las de su restaurante, admin ve todas

### Triggers

- `on_auth_user_created` → crea perfil automáticamente
- `on_profile_created` → crea restaurante vacío si rol es `restaurant`
- `set_updated_at` → actualiza timestamp al modificar restaurante

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Type check
npx astro check

# Seed (crear usuarios de prueba)
node --env-file=.env supabase/seed.mjs
```

## Prettier
npx prettier --write .

## Setup Inicial

1. Crear proyecto en [Supabase](https://supabase.com)
2. Copiar `.env` con las credenciales:
   ```
   PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```
3. Ejecutar `supabase/migration.sql` en el SQL Editor de Supabase
4. Ejecutar seed: `node --env-file=.env supabase/seed.mjs`
5. `npm run dev`

## Variables de Entorno

| Variable                    | Descripción                          |
| --------------------------- | ------------------------------------ |
| `PUBLIC_SUPABASE_URL`       | URL del proyecto Supabase            |
| `PUBLIC_SUPABASE_ANON_KEY`  | Clave pública (anon)                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo server-side) |
