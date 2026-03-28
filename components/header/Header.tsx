'use client';

import { useCallback, useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import NavLinks from '@/components/header/NavLinks';
import LanguageSelector from '@/components/header/LanguageSelector';
import UserMenu from '@/components/header/UserMenu';
import Logo from '@/components/ui/Logo';
import { useRouter } from 'next/navigation';
import { langCodes, defaultLang, type LangCode } from '@/lib/i18n';

interface Profile {
  username: string | null;
  full_name: string | null;
}

interface HeaderProps {
  initialUser: User | null;
  lang: string;
  role?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

export default function Header({
  initialUser,
  lang: rawLang,
  role: initialRole,
  username: initialUsername,
}: HeaderProps) {
  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(
    initialUser
      ? {
          username: initialUsername ?? null,
          full_name: initialUsername ?? null,
        }
      : null,
  );
  const [role, setRole] = useState<string | null>(initialRole ?? null);

  const supabase = createSupabaseBrowser();
  const router = useRouter();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('username, full_name, role')
        .eq('id', userId)
        .maybeSingle();

      setProfile(
        data
          ? {
              username: data.username,
              full_name: data.full_name,
            }
          : null,
      );
      setRole(data?.role ?? null);
    },
    [supabase],
  );

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) await fetchProfile(currentUser.id);
        else {
          setProfile(null);
          setRole(null);
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'SIGNED_OUT' ||
          event === 'USER_UPDATED'
        ) {
          router.refresh();
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile, router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${lang}`);
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo size="lg" lang={lang} />

        <NavLinks lang={lang} />

        <div className="hidden md:flex items-center gap-4">
          <UserMenu
            lang={lang}
            user={user}
            profile={profile}
            userRole={role}
            handleSignOut={handleSignOut}
          />

          <LanguageSelector lang={lang} />
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-[5px]"
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
        </button>
      </div>

      {isMenuOpen && (
        <>
          <NavLinks lang={lang} isMobile closeMenu={() => setIsMenuOpen(false)} />
          <div className="flex flex-col px-6 pb-6 gap-2 border-t border-slate-400/10">
            <UserMenu
              lang={lang}
              user={user}
              profile={profile}
              userRole={role}
              handleSignOut={handleSignOut}
              isMobile
              closeMenu={() => setIsMenuOpen(false)}
            />
            <LanguageSelector lang={lang} isMobile />
          </div>
        </>
      )}
    </header>
  );
}
