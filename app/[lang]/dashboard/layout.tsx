import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getUserWithRole } from '@/lib/auth';
import { t, defaultLang, langCodes, localePath, type LangCode } from '@/lib/i18n';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { lang: rawLang } = await params;
  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  const { user, role } = await getUserWithRole();

  if (!user) {
    redirect(localePath('/login', lang));
  }

  if (role !== 'restaurant' && role !== 'admin') {
    redirect(localePath('/restaurants', lang));
  }

  // 👇 obtener pathname actual
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  const navItems =
    role === 'admin'
      ? [{ href: localePath('/dashboard', lang), label: 'Admin', icon: '🛠️' }]
      : [
          { href: localePath('/dashboard', lang), label: t('dashboard.panel', lang), icon: '📊' },
          {
            href: localePath('/dashboard/my-restaurant', lang),
            label: t('dashboard.my_restaurant', lang),
            icon: '🍽️',
          },
          {
            href: localePath('/dashboard/reservation', lang),
            label: t('dashboard.reservations', lang),
            icon: '📅',
          },
        ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 mt-[71px]">
      <aside className="relative w-64 border-r border-slate-700/50 bg-slate-800/90">
        <div className="flex h-16 items-center border-b border-slate-700/50 px-6">
          <Link href={localePath('/dashboard', lang)} className="text-lg font-bold">
            <span className="text-emerald-400">Mi</span> Panel
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition
                  ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-slate-700/50 p-4">
          <Link href={localePath('/', lang)} className="block text-sm text-slate-400">
            ← Volver
          </Link>
        </div>
      </aside>

      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}