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
    'La Terraza 360',
    'la-terraza-360',
    'Restaurante mediterráneo con terraza panorámica y menú degustación.',
    '+34 910 111 222',
    'reservas@laterraza360.com',
    'Gran Vía 101, Madrid',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    null,
    'Bistro Central',
    'bistro-central',
    'Bistró urbano con cocina de temporada y ambiente moderno.',
    '+34 933 444 555',
    'hola@bistrocentral.es',
    'Passeig de Gràcia 77, Barcelona',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
  )
on conflict (slug) do nothing;

with target_restaurants as (
  select id, slug
  from public.restaurants
  where slug in ('la-terraza-360', 'bistro-central')
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
    ('table_01', 4, 2, 2, 'round'),
    ('table_02', 2, 6, 2, 'square'),
    ('table_03', 6, 2, 6, 'round'),
    ('table_04', 4, 6, 6, 'square')
) as t(name, capacity, position_x, position_y, shape) on true
where not exists (
  select 1
  from public.tables existing
  where existing.restaurant_id = tr.id
    and existing.name = t.name
);
