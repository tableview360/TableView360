import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars. Run with:\n  node --env-file=.env supabase/seed.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  {
    email: 'admin@tableview360.com',
    password: 'secret12',
    role: 'admin',
    full_name: 'Admin User',
    username: 'admin',
    phone: '+34 600 000 001',
  },
  {
    email: 'restaurant@tableview360.com',
    password: 'secret12',
    role: 'restaurant',
    full_name: 'Carlos García',
    username: 'carlos_chef',
    phone: '+34 600 000 002',
  },
  {
    email: 'client@tableview360.com',
    password: 'secret12',
    role: 'client',
    full_name: 'María López',
    username: 'maria_lopez',
    phone: '+34 600 000 003',
  },
];

async function seed() {
  console.log('🌱 Seeding users...\n');

  for (const u of users) {
    // Create user via Admin API (handles password hashing correctly)
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role },
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`⚠️  ${u.email} already exists, skipping auth creation`);
        // Get existing user
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((x) => x.email === u.email);
        if (existing) {
          await supabase.from('profiles').upsert({
            id: existing.id,
            role: u.role,
            full_name: u.full_name,
            username: u.username,
            phone: u.phone,
          });
          console.log(`   ✅ Profile updated for ${u.email} (${u.role})`);
        }
        continue;
      }
      console.error(`❌ Error creating ${u.email}:`, error.message);
      continue;
    }

    const userId = data.user.id;
    console.log(`✅ Created ${u.email} (${u.role}) → ${userId}`);

    // Update profile with extra fields
    await supabase.from('profiles').upsert({
      id: userId,
      role: u.role,
      full_name: u.full_name,
      username: u.username,
      phone: u.phone,
    });
    console.log(`   📝 Profile set`);
  }

  // Get restaurant owner ID
  const { data: list } = await supabase.auth.admin.listUsers();
  const restaurantUser = list?.users?.find((x) => x.email === 'restaurant@tableview360.com');

  if (restaurantUser) {
    // Check if restaurant already exists
    const { data: existing } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', restaurantUser.id)
      .maybeSingle();

    if (existing) {
      // Update the auto-created restaurant
      await supabase.from('restaurants').update({
        name: 'La Terraza de Carlos',
        email: 'info@laterrazadecarlos.com',
        phone: '+34 912 345 678',
        description: 'Cocina mediterránea con vistas panorámicas al mar. Ingredientes frescos de temporada y una carta de vinos selecta.',
        address: 'Calle Mayor 42, Planta 8',
        city: 'Barcelona',
        capacity: 60,
      }).eq('id', existing.id);
      console.log(`\n🍽️  Updated restaurant: La Terraza de Carlos`);

      // Add sample reservations
      const clientUser = list?.users?.find((x) => x.email === 'client@tableview360.com');
      if (clientUser) {
        const today = new Date();
        const in2days = new Date(today);
        in2days.setDate(today.getDate() + 2);
        const in5days = new Date(today);
        in5days.setDate(today.getDate() + 5);

        await supabase.from('reservations').upsert([
          {
            restaurant_id: existing.id,
            client_id: clientUser.id,
            date: in2days.toISOString().split('T')[0],
            time: '20:00',
            guests: 4,
            status: 'pending',
            notes: 'Mesa con vistas si es posible',
          },
          {
            restaurant_id: existing.id,
            client_id: clientUser.id,
            date: in5days.toISOString().split('T')[0],
            time: '14:00',
            guests: 2,
            status: 'confirmed',
            notes: 'Cumpleaños, traer tarta',
          },
        ], { onConflict: 'id' });
        console.log(`📅 Added 2 sample reservations`);
      }
    }
  }

  console.log('\n✨ Seed complete!\n');
  console.log('Credentials:');
  console.log('  Admin:      admin@tableview360.com / secret12');
  console.log('  Restaurant: restaurant@tableview360.com / secret12');
  console.log('  Client:     client@tableview360.com / secret12');
}

seed().catch(console.error);
