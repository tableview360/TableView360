import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../hooks/useLanguage';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  logo_url: string | null;
  created_at: string;
}

const RestaurantsPage = () => {
  const { getLocalizedPath } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurants = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('restaurants')
        .select('id,name,slug,address,logo_url,created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setRestaurants([]);
      } else {
        setRestaurants(data ?? []);
      }

      setLoading(false);
    };

    loadRestaurants();
  }, []);

  return (
    <section className="max-w-7xl mx-auto py-12 px-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-transparent">
          Restaurantes
        </h1>
        <p className="text-slate-400">Todos los restaurantes registrados.</p>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-slate-400">Cargando restaurantes...</p>}
        {error && (
          <p className="text-red-300">Error al cargar restaurantes: {error}</p>
        )}
        {!loading && !error && restaurants.length === 0 && (
          <p className="text-slate-400">No hay restaurantes registrados.</p>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={getLocalizedPath(`/restaurant/${restaurant.slug}`)}
                className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-0 no-underline overflow-hidden transition-colors hover:border-violet-400/60"
              >
                <article>
                  {restaurant.logo_url ? (
                    <img
                      src={restaurant.logo_url}
                      alt={restaurant.name}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-slate-700 to-slate-900" />
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-slate-100">
                      {restaurant.name}
                    </h2>
                    <p className="text-slate-300 mt-2">
                      {restaurant.address || 'Ubicación no disponible'}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantsPage;
