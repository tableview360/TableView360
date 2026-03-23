-- ============================================
-- Seed: Create test users for development
-- Run this AFTER migration.sql
-- ============================================

-- 1. Create Admin user
-- Email: admin@tableview360.com / Password: secret12
SELECT id FROM auth.users WHERE email = 'admin@tableview360.com'
UNION ALL SELECT gen_random_uuid() LIMIT 1;

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@tableview360.com',
  crypt('secret12', gen_salt('bf')),
  now(),
  '{"role": "admin"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Admin identity (required for Supabase auth)
INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'admin@tableview360.com',
  'email',
  '{"sub": "a0000000-0000-0000-0000-000000000001", "email": "admin@tableview360.com"}'::jsonb,
  now(), now(), now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- 2. Create Restaurant owner user
-- Email: restaurant@tableview360.com / Password: secret12
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'restaurant@tableview360.com',
  crypt('secret12', gen_salt('bf')),
  now(),
  '{"role": "restaurant"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'restaurant@tableview360.com',
  'email',
  '{"sub": "b0000000-0000-0000-0000-000000000002", "email": "restaurant@tableview360.com"}'::jsonb,
  now(), now(), now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- 3. Create Client user
-- Email: client@tableview360.com / Password: secret12
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'client@tableview360.com',
  crypt('secret12', gen_salt('bf')),
  now(),
  '{"role": "client"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000003',
  'client@tableview360.com',
  'email',
  '{"sub": "c0000000-0000-0000-0000-000000000003", "email": "client@tableview360.com"}'::jsonb,
  now(), now(), now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- ============================================
-- Profiles (the trigger should create these,
-- but we insert manually for seed data)
-- ============================================

INSERT INTO public.profiles (id, role, full_name, username, phone) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'Admin User', 'admin', '+34 600 000 001'),
  ('b0000000-0000-0000-0000-000000000002', 'restaurant', 'Carlos García', 'carlos_chef', '+34 600 000 002'),
  ('c0000000-0000-0000-0000-000000000003', 'client', 'María López', 'maria_lopez', '+34 600 000 003')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  phone = EXCLUDED.phone;

-- ============================================
-- Restaurant for the restaurant owner
-- ============================================

INSERT INTO public.restaurants (id, owner_id, name, email, phone, description, address, city, capacity) VALUES
  ('d0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000002',
   'La Terraza de Carlos',
   'info@laterrazadecarlos.com',
   '+34 912 345 678',
   'Cocina mediterránea con vistas panorámicas al mar. Ingredientes frescos de temporada y una carta de vinos selecta.',
   'Calle Mayor 42, Planta 8',
   'Barcelona',
   60)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- A couple of sample reservations
-- ============================================

INSERT INTO public.reservations (restaurant_id, client_id, date, time, guests, status, notes) VALUES
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003',
   CURRENT_DATE + interval '2 days', '20:00', 4, 'pending', 'Mesa con vistas si es posible'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003',
   CURRENT_DATE + interval '5 days', '14:00', 2, 'confirmed', 'Cumpleaños, traer tarta')
ON CONFLICT DO NOTHING;
