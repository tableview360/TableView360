import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserWithRole } from '@/lib/auth';
import AdminClients from '@/components/admin/AdminClients';
import AdminRestaurants from '@/components/admin/AdminRestaurants';
import AdminReservations from '@/components/admin/AdminReservations';
import { defaultLang, langCodes, localePath, type LangCode } from '@/lib/i18n';

interface DashboardPageProps {
  params: Promise<{ lang: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang: rawLang } = await params;

  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  const { user, role } = await getUserWithRole();

  // 🔐 Auth protection
  if (!user) {
    redirect(localePath('/login', lang));
  }

  if (role !== 'restaurant' && role !== 'admin') {
    redirect(localePath('/restaurants', lang));
  }

  // 🧠 Admin panel
  if (role === 'admin') {
    return (
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-bold">Gestión de usuarios</h2>
          <AdminClients />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Gestión de restaurantes</h2>
          <AdminRestaurants />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Gestión de reservas</h2>
          <AdminReservations />
        </section>
      </div>
    );
  }

  // 🍽️ Restaurant dashboard
  const supabase = await createSupabaseServer();

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!restaurant) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg">No tienes un restaurante asignado</p>
      </div>
    );
  }

  // 📊 Stats (igual que en Astro)
  const { count: totalReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id);

  const { count: pendingReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .eq('status', 'pending');

  const { count: confirmedReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .eq('status', 'confirmed');

  const { count: photoCount } = await supabase
    .from('restaurant_photos')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id);

  const stats = [
    {
      label: 'Reservas totales',
      value: totalReservations ?? 0,
      icon: '📅',
      color: 'bg-violet-500/10 text-violet-400',
    },
    {
      label: 'Pendientes',
      value: pendingReservations ?? 0,
      icon: '⏳',
      color: 'bg-amber-500/10 text-amber-300',
    },
    {
      label: 'Confirmadas',
      value: confirmedReservations ?? 0,
      icon: '✅',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Fotos',
      value: photoCount ?? 0,
      icon: '📷',
      color: 'bg-violet-500/10 text-violet-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">
          {restaurant.name}
        </h2>
        <p className="mt-1 text-slate-500">
          Bienvenido a tu panel de gestión
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-700/50 bg-slate-800/90 p-6"
          >
            <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>
              <span className="text-xl">{stat.icon}</span>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-100">
              {stat.value}
            </p>

            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid gap-6 sm:grid-cols-2">
        <a
          href={localePath('/dashboard/mi-restaurante', lang)}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/90 p-6 transition hover:shadow-xl"
        >
          <h3 className="text-lg font-semibold text-slate-100">
            🍽️ Editar Restaurante
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Modifica nombre, email, teléfono, descripción y fotos
          </p>
        </a>

        <a
          href={localePath('/dashboard/reservas', lang)}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/90 p-6 transition hover:shadow-xl"
        >
          <h3 className="text-lg font-semibold text-slate-100">
            📅 Ver Reservas
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Gestiona las reservas de tus clientes
          </p>
        </a>
      </div>
    </div>
  );
}