import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getUserWithRole } from '@/lib/auth';
import ProfileSettings from '@/components/ProfileSettings';
import { t, defaultLang, langCodes, type LangCode } from '@/lib/i18n';

interface SettingsPageProps {
  params: Promise<{ lang: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { lang: rawLang } = await params;

  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  const { user, role } = await getUserWithRole();

  // 🔐 protección
  if (!user) {
    redirect(`/${lang}/login`);
  }

  const supabase = await createSupabaseServer();

  // 👤 perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, phone, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const username = profile?.username || profile?.full_name || null;
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 pt-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          {t('profile.title', lang)}
        </h1>
        <p className="mt-1 text-slate-400">
          {t('profile.subtitle', lang)}
        </p>
      </div>

      {/* Settings */}
      <ProfileSettings
        userId={user.id}
        role={role ?? null}
        initialUsername={profile?.username ?? null}
        initialFullName={profile?.full_name ?? null}
        initialPhone={profile?.phone ?? null}
        initialAvatarUrl={avatarUrl}
        email={user.email ?? null}
        lang={lang}
      />
    </div>
  );
}