export const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const;

export type LangCode = 'es' | 'en';

const translations: Record<LangCode, Record<string, string>> = {
  es: {
    // Nav
    'nav.restaurants': 'Restaurantes',
    'nav.cms': 'CMS Admin',
    'nav.dashboard': 'Mi Panel',
    'nav.signin': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    // Hero
    'hero.title1': 'Reserva en los mejores',
    'hero.title2': 'restaurantes',
    'hero.subtitle':
      'Descubre restaurantes, haz reservas en segundos y gestiona tu negocio gastronómico desde un solo lugar.',
    'hero.cta': 'Empezar ahora',
    'hero.cta_login': 'Ya tengo cuenta',
    'hero.cta_restaurants': 'Ver Restaurantes',
    // Auth
    'auth.login_title': 'Iniciar Sesión',
    'auth.login_subtitle': 'Inicia sesión para ver los restaurantes',
    'auth.register_title': 'Crear cuenta',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.password_min': 'Mínimo 6 caracteres',
    'auth.full_name': 'Nombre completo',
    'auth.username': 'Nombre de usuario',
    'auth.phone': 'Teléfono',
    'auth.role_question': '¿Cómo quieres registrarte?',
    'auth.role_client': 'Cliente',
    'auth.role_client_desc': 'Hacer reservas',
    'auth.role_restaurant': 'Restaurante',
    'auth.role_restaurant_desc': 'Gestionar tu local',
    'auth.restaurant_name': 'Nombre del restaurante',
    'auth.restaurant_address': 'Dirección del restaurante',
    'auth.restaurant_capacity': 'Capacidad (personas)',
    'auth.submit_login': 'Entrar',
    'auth.submit_register': 'Crear cuenta',
    'auth.loading_login': 'Entrando...',
    'auth.loading_register': 'Registrando...',
    'auth.no_account': '¿No tienes cuenta?',
    'auth.has_account': '¿Ya tienes cuenta?',
    'auth.success_register': '¡Cuenta creada! Redirigiendo...',
    'auth.error_required': 'Todos los campos son obligatorios',
    'auth.error_connection': 'Error de conexión',
    // Restaurants
    'restaurants.title': 'Restaurantes',
    'restaurants.subtitle': 'Explora y reserva en los mejores restaurantes',
    'restaurants.empty': 'No hay restaurantes disponibles todavía',
    'restaurants.back': 'Restaurantes',
    // Reservation
    'reservation.title': 'Hacer una reserva',
    'reservation.date': 'Fecha',
    'reservation.time': 'Hora',
    'reservation.guests': 'Comensales',
    'reservation.person': 'persona',
    'reservation.persons': 'personas',
    'reservation.notes': 'Notas (opcional)',
    'reservation.notes_placeholder': 'Alergias, celebraciones, etc.',
    'reservation.submit': 'Reservar',
    'reservation.loading': 'Reservando...',
    'reservation.success': '¡Reserva creada! Te confirmaremos pronto.',
    'reservation.only_clients':
      'Las reservas están disponibles solo para clientes registrados.',
    'reservation.photos': 'Fotos',
  },
  en: {
    // Nav
    'nav.restaurants': 'Restaurants',
    'nav.cms': 'CMS Admin',
    'nav.dashboard': 'My Panel',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Log Out',
    // Hero
    'hero.title1': 'Book at the best',
    'hero.title2': 'restaurants',
    'hero.subtitle':
      'Discover restaurants, make reservations in seconds, and manage your food business from one place.',
    'hero.cta': 'Get started',
    'hero.cta_login': 'I have an account',
    'hero.cta_restaurants': 'View Restaurants',
    // Auth
    'auth.login_title': 'Sign In',
    'auth.login_subtitle': 'Sign in to see restaurants',
    'auth.register_title': 'Create account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.password_min': 'Minimum 6 characters',
    'auth.full_name': 'Full name',
    'auth.username': 'Username',
    'auth.phone': 'Phone',
    'auth.role_question': 'How do you want to register?',
    'auth.role_client': 'Client',
    'auth.role_client_desc': 'Make reservations',
    'auth.role_restaurant': 'Restaurant',
    'auth.role_restaurant_desc': 'Manage your venue',
    'auth.restaurant_name': 'Restaurant name',
    'auth.restaurant_address': 'Restaurant address',
    'auth.restaurant_capacity': 'Capacity (people)',
    'auth.submit_login': 'Sign In',
    'auth.submit_register': 'Create account',
    'auth.loading_login': 'Signing in...',
    'auth.loading_register': 'Registering...',
    'auth.no_account': "Don't have an account?",
    'auth.has_account': 'Already have an account?',
    'auth.success_register': 'Account created! Redirecting...',
    'auth.error_required': 'All fields are required',
    'auth.error_connection': 'Connection error',
    // Restaurants
    'restaurants.title': 'Restaurants',
    'restaurants.subtitle': 'Explore and book at the best restaurants',
    'restaurants.empty': 'No restaurants available yet',
    'restaurants.back': 'Restaurants',
    // Reservation
    'reservation.title': 'Make a reservation',
    'reservation.date': 'Date',
    'reservation.time': 'Time',
    'reservation.guests': 'Guests',
    'reservation.person': 'person',
    'reservation.persons': 'people',
    'reservation.notes': 'Notes (optional)',
    'reservation.notes_placeholder': 'Allergies, celebrations, etc.',
    'reservation.submit': 'Reserve',
    'reservation.loading': 'Reserving...',
    'reservation.success': 'Reservation created! We will confirm soon.',
    'reservation.only_clients':
      'Reservations are only available for registered clients.',
    'reservation.photos': 'Photos',
  },
};

export function t(key: string, lang: LangCode): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

/** Get the lang-prefixed version of a path */
export function localePath(path: string, lang: LangCode): string {
  const clean = path.replace(/^\/(es|en)(\/|$)/, '/');
  if (lang === 'en') return clean || '/';
  return `/${lang}${clean === '/' ? '' : clean}`;
}

/** Extract lang from a URL path */
export function langFromPath(path: string): LangCode {
  if (path.startsWith('/es/') || path === '/es') return 'es';
  return 'en';
}
