interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  logo_url: string | null;
  phone: string | null;
}

interface Props {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <a
      href={`/restaurants/${restaurant.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-800/80 shadow-sm transition hover:shadow-xl"
    >
      <div className="aspect-video bg-slate-700">
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-500">
            🍽️
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-violet-400">
          {restaurant.name}
        </h3>
        {restaurant.city && (
          <p className="mt-1 text-sm text-slate-500">📍 {restaurant.city}</p>
        )}
        {restaurant.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">
            {restaurant.description}
          </p>
        )}
      </div>
    </a>
  );
}
