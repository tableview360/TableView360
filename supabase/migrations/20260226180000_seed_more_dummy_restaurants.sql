-- Añadir 5 restaurantes dummy adicionales para testing
insert into public.restaurants (
  owner_id,
  name,
  slug,
  description,
  phone,
  email,
  address,
  logo_url
)
values
  (
    null,
    'Sakura Sushi Bar',
    'sakura-sushi-bar',
    'Auténtico sushi japonés con ingredientes importados de Tsukiji. Omakase y menús degustación.',
    '+34 915 678 901',
    'reservas@sakurasushi.es',
    'Calle Serrano 45, Madrid',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    null,
    'El Fogón Argentino',
    'el-fogon-argentino',
    'Parrilla argentina tradicional con carnes premium de la Pampa. Vinos de Mendoza.',
    '+34 934 567 890',
    'info@elfogonargentino.com',
    'Carrer de València 188, Barcelona',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    null,
    'Trattoria Bella Napoli',
    'trattoria-bella-napoli',
    'Cocina italiana auténtica con pizzas al horno de leña y pasta fresca casera.',
    '+34 963 234 567',
    'ciao@bellanapoli.es',
    'Calle Colón 22, Valencia',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    null,
    'The Green Garden',
    'the-green-garden',
    'Restaurante vegano y vegetariano con productos orgánicos de km0. Brunch los fines de semana.',
    '+34 944 123 456',
    'hello@greengarden.bio',
    'Alameda de Mazarredo 15, Bilbao',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    null,
    'Marisquería Puerto Azul',
    'marisqueria-puerto-azul',
    'Mariscos y pescados frescos del día. Arroces, zarzuelas y vistas al mar.',
    '+34 952 789 012',
    'reservas@puertoazul.com',
    'Paseo Marítimo 88, Málaga',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
  )
on conflict (slug) do nothing;

-- Añadir mesas para los nuevos restaurantes
with target_restaurants as (
  select id, slug
  from public.restaurants
  where slug in (
    'sakura-sushi-bar',
    'el-fogon-argentino',
    'trattoria-bella-napoli',
    'the-green-garden',
    'marisqueria-puerto-azul'
  )
)
insert into public.tables (
  restaurant_id,
  name,
  capacity,
  position_x,
  position_y,
  shape
)
select tr.id, t.name, t.capacity, t.position_x, t.position_y, t.shape
from target_restaurants tr
join (
  values
    ('table_01', 2, 1, 1, 'round'),
    ('table_02', 4, 4, 1, 'square'),
    ('table_03', 2, 7, 1, 'round'),
    ('table_04', 6, 1, 4, 'round'),
    ('table_05', 4, 4, 4, 'square'),
    ('table_06', 4, 7, 4, 'round'),
    ('table_07', 8, 4, 7, 'square'),
    ('table_08', 2, 1, 7, 'round')
) as t(name, capacity, position_x, position_y, shape) on true
where not exists (
  select 1
  from public.tables existing
  where existing.restaurant_id = tr.id
    and existing.name = t.name
);
