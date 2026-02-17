import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import NavLinks from './NavLinks';

interface Profile {
  username: string | null;
  full_name: string | null;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .maybeSingle(); // <- evita bloqueo si no existe

    if (error) console.error('Profile fetch error:', error);
    setProfile(data ?? null);
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) await fetchProfile(user.id);

      setIsLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) await fetchProfile(currentUser.id);
        else setProfile(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-b border-slate-400/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline text-slate-50"
        >
          <span className="text-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
            ◈
          </span>
          <span className="text-2xl font-bold tracking-tight">
            TableView
            <span className="bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              360
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavLinks
          isLoading={isLoading}
          user={user}
          profile={profile}
          handleSignOut={handleSignOut}
        />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-slate-50 rounded-sm transition-all duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-slate-50 rounded-sm transition-all duration-300 ${
              isMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-slate-50 rounded-sm transition-all duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <NavLinks
          isLoading={isLoading}
          user={user}
          profile={profile}
          handleSignOut={handleSignOut}
          isMobile
          closeMenu={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
