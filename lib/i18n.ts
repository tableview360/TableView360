export type LangCode = 'en' | 'es';

export const defaultLang: LangCode = 'en';

export interface Language {
  code: LangCode;
  label: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const translations: Record<LangCode, Record<string, string>> = {
  es: {
    // Nav
    'nav.home': 'Inicio',
    'nav.restaurants': 'Restaurantes',
    'nav.prices': 'Precios',
    'nav.about': 'Sobre Nosotros',
    'nav.contact-us': 'Contáctanos',
    'nav.dashboard': 'Mi Panel',
    'nav.signin': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    // home
    'home.title1': 'Reserva en los mejores',
    'home.title2': 'restaurantes',
    'home.subtitle':
      'Descubre restaurantes, haz reservas en segundos y gestiona tu negocio gastronómico desde un solo lugar.',
    'home.cta': 'Empezar ahora',
    'home.cta_login': 'Ya tengo cuenta',
    'home.cta_restaurants': 'Ver Restaurantes',
    // Auth
    'auth.login_title': 'Iniciar Sesión',
    'auth.login_subtitle': 'Inicia sesión para ver los restaurantes',
    'auth.register_title': 'Crear cuenta',
    'auth.register': 'Regístrate',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.password_min': 'Mínimo 6 caracteres',
    'auth.full_name': 'Nombre completo',
    'auth.username': 'Nombre de usuario',
    'auth.phone': 'Teléfono',
    'auth.city': 'Ciudad',
    'auth.address': 'Dirección',
    'auth.description': 'Descripción',
    'auth.role_question': '¿Cómo quieres registrarte?',
    'auth.role_client': 'Cliente',
    'auth.role_client_desc': 'Hacer reservas',
    'auth.role_restaurant': 'Restaurante',
    'auth.role_restaurant_desc': 'Gestionar tu local',
    'auth.restaurant_name': 'Nombre del restaurante',
    'auth.restaurant_address': 'Dirección del restaurante',
    'auth.restaurant_capacity': 'Capacidad (personas)',
    'auth.restaurant_details': 'Datos del restaurante',
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
    'restaurants.photos': 'Fotos del restaurante',
    'restaurants.uploading': 'Subiendo...',
    'restaurants.upload_photos': '+ Subir foto',
    'restaurants.no_photos': 'No hay fotos. Sube la primera.',
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
    // Nav extras
    'nav.profile': 'Mi Perfil',
    'nav.my_reservations': 'Mis Reservas',
    'nav.user_fallback': 'Usuario',
    // Profile page
    'profile.title': 'Mi Perfil',
    'profile.subtitle': 'Gestiona tu información personal y acceso',
    'profile.photo': 'Foto de perfil',
    'profile.change_photo': 'Cambiar foto',
    'profile.photo_hint': 'JPG, PNG, WebP · máx. 3 MB',
    'profile.photo_size_error': 'La imagen no puede superar los 3 MB.',
    'profile.photo_type_error': 'Solo se permiten imágenes.',
    'profile.personal_info': 'Información personal',
    'profile.email_readonly': 'El email no se puede cambiar.',
    'profile.update_success': 'Perfil actualizado correctamente.',
    'profile.save': 'Guardar cambios',
    'profile.saving': 'Guardando...',
    'profile.change_password': 'Cambiar contraseña',
    'profile.new_password': 'Nueva contraseña',
    'profile.confirm_password': 'Confirmar contraseña',
    'profile.password_placeholder': 'Mínimo 6 caracteres',
    'profile.repeat_password': 'Repite la contraseña',
    'profile.password_min_error':
      'La contraseña debe tener al menos 6 caracteres.',
    'profile.password_mismatch': 'Las contraseñas no coinciden.',
    'profile.password_success': 'Contraseña actualizada correctamente.',
    'profile.updating': 'Actualizando...',
    'profile.update_password': 'Cambiar contraseña',
    // My reservations page
    'my_reservations.title': 'Mis Reservas',
    'my_reservations.subtitle': 'Historial de todas tus reservas',
    'my_reservations.new': '+ Nueva reserva',
    'my_reservations.unknown_restaurant': 'Restaurante desconocido',
    'my_reservations.confirmed': 'Confirmada',
    'my_reservations.cancelled': 'Cancelada',
    'my_reservations.pending': 'Pendiente',
    'my_reservations.view': 'Ver restaurante →',
    'my_reservations.edit': '✏️ Editar',
    'my_reservations.edit_title': 'Editar reserva',
    'my_reservations.people': 'Personas',
    'my_reservations.cancel': 'Cancelar',
    'my_reservations.save': 'Guardar cambios',
    'my_reservations.saving': 'Guardando...',
    'my_reservations.empty': 'No tienes reservas todavía',
    'my_reservations.empty_hint':
      'Explora los restaurantes y haz tu primera reserva',
    'my_reservations.explore': 'Ver restaurantes',
    // Home sections
    'home.restaurants_title': 'Restaurantes',
    'home.restaurants_subtitle': 'Descubre dónde reservar hoy',
    'home.popular_tab': '🔥 Populares',
    'home.nearby_tab': '📍 Cerca de ti',
    'home.no_restaurants': 'No hay restaurantes disponibles aún.',
    'home.detecting_location': 'Detectando tu ubicación...',
    'home.location_denied':
      'Permiso de ubicación denegado. Actívalo en tu navegador.',
    'home.city_not_found': 'No se pudo detectar tu ciudad.',
    'home.location_error': 'Error al obtener la ubicación.',
    'home.no_nearby': 'No encontramos restaurantes en tu ciudad todavía.',
    'home.showing_nearby': 'Mostrando restaurantes en',
    'home.reservations_label': 'reservas',
    'home.view_all': 'Ver todos los restaurantes →',
    'home.recent_title': 'Mis últimas reservas',
    'home.recent_subtitle': 'Resumen de tu actividad reciente',
    'home.see_all': 'Ver todas →',
    'home.no_recent': 'Aún no tienes reservas.',
    'home.explore': 'Explorar restaurantes →',
    'home.restaurant_fallback': 'Restaurante',
    // Common
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.saving': 'Guardando...',
    // Footer
    'footer.description':
      'La plataforma inteligente para reservas de restaurantes con vistas inmersivas en 360°. Descubre, explora y reserva tu mesa perfecta.',
    'footer.navigation': 'Navegación',
    'footer.legal': 'Legal',
    'footer.productOf': 'Un producto de Stoyko Boshnakov.',
    'footer.nav.home': 'Inicio',
    'footer.nav.restaurants': 'Restaurantes',
    'footer.nav.blog': 'Blog',
    'footer.nav.cookiePolicy': 'Política de cookies',
    FAQ: 'Preguntas frecuentes',
    'Terms of Service': 'Términos de servicio',
    'Privacy / GDPR': 'Privacidad / GDPR',
    "contact.title": "Contáctanos",
    "contact.send_message": "Envíanos un mensaje",
    "contact.rights.reserved": "Todos los derechos reservados.",
    "contact.name": "Tu nombre",
    "contact.email": "Tu correo electrónico",
    "contact.your.message": "Tu mensaje",
    "contact.send.message": "Enviar mensaje",
    "contact.sending": "Enviando...",
    "contact.message.success": "¡Mensaje enviado correctamente!",
    "contact.message.fill.fields": "Por favor, completa todos los campos correctamente.",
    // Dashboard Restaurant
    "dashboard.panel": "Panel",
    "dashboard.my_restaurant": "Mi Restaurante",
    "dashboard.reservations": "Reservas",
    // FAQ
    'faq.q1': '¿Qué es TableView360?',
    'faq.a1':
      'TableView360 es una plataforma de reservas de restaurantes que ofrece vistas inmersivas en 360° para que puedas explorar el local antes de reservar.',
    'faq.q2': '¿Cómo hago una reserva?',
    'faq.a2':
      'Regístrate como cliente, navega por los restaurantes disponibles, elige tu mesa y selecciona la fecha y hora deseadas.',
    'faq.q3': '¿Es gratis usar TableView360?',
    'faq.a3':
      'Sí, registrarse y hacer reservas es completamente gratuito para los clientes.',
    'faq.q4': '¿Cómo puedo registrar mi restaurante?',
    'faq.a4':
      'Crea una cuenta seleccionando el tipo "Restaurante" durante el registro. Luego podrás gestionar tu local desde el panel de control.',
    // Terms
    'terms.section1_title': '1. Aceptación de los términos',
    'terms.section1_body':
      'Al acceder y utilizar TableView360, aceptas estar sujeto a estos términos de servicio. Si no estás de acuerdo con alguna parte, no debes utilizar la plataforma.',
    'terms.section2_title': '2. Uso del servicio',
    'terms.section2_body':
      'Te comprometes a utilizar la plataforma de forma responsable, no crear cuentas falsas, y respetar las políticas de reserva de cada restaurante.',
    'terms.section3_title': '3. Reservas y cancelaciones',
    'terms.section3_body':
      'Las reservas realizadas a través de TableView360 están sujetas a la disponibilidad y las políticas de cada restaurante. Cancela con antelación para evitar penalizaciones.',
    // Privacy
    'privacy.section1_title': '1. Datos que recopilamos',
    'privacy.section1_body':
      'Recopilamos tu nombre, correo electrónico, teléfono y datos de reserva para proporcionarte el servicio. No vendemos tus datos a terceros.',
    'privacy.section2_title': '2. Tus derechos (GDPR)',
    'privacy.section2_body':
      'Tienes derecho a acceder, rectificar, eliminar y exportar tus datos personales en cualquier momento. Contáctanos para ejercer estos derechos.',
    'privacy.section3_title': '3. Cookies',
    'privacy.section3_body':
      'Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies de preferencia de idioma. No utilizamos cookies de rastreo publicitario.',
    // Blog
    'blog.subtitle': 'Noticias, consejos y novedades de TableView360.',
    'blog.comingSoon':
      'Estamos preparando contenido increíble para ti. ¡Pronto llegarán nuevos artículos!',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.restaurants': 'Restaurants',
    'nav.prices': 'Prices',
    'nav.about': 'About',
    'nav.contact-us': 'Contact Us',
    'nav.dashboard': 'My Panel',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Log Out',
    // Home
    'home.title1': 'Book at the best',
    'home.title2': 'restaurants',
    'home.subtitle':
      'Discover restaurants, make reservations in seconds, and manage your food business from one place.',
    'home.cta': 'Get started',
    'home.cta_login': 'I have an account',
    'home.cta_restaurants': 'View Restaurants',
    // Auth
    'auth.login_title': 'Sign In',
    'auth.login_subtitle': 'Sign in to see restaurants',
    'auth.register_title': 'Create account',
    'auth.register': 'Sign up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.password_min': 'Minimum 6 characters',
    'auth.full_name': 'Full name',
    'auth.username': 'Username',
    'auth.phone': 'Phone',
    'auth.address': 'Address',
    'auth.description': 'Description',
    'auth.city': 'City',
    'auth.role_question': 'How do you want to register?',
    'auth.role_client': 'Client',
    'auth.role_client_desc': 'Make reservations',
    'auth.role_restaurant': 'Restaurant',
    'auth.role_restaurant_desc': 'Manage your venue',
    'auth.restaurant_name': 'Restaurant name',
    'auth.restaurant_address': 'Restaurant address',
    'auth.restaurant_capacity': 'Capacity (people)',
    'auth.restaurant_details': 'Restaurant details',
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
    'restaurants.photos': 'Restaurant photos',
    'restaurants.uploading': 'Uploading...',
    'restaurants.upload_photos': '+ Upload photo',
    'restaurants.no_photos': 'No photos yet. Add your first photo.',
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
    // Nav extras
    'nav.profile': 'My Profile',
    'nav.my_reservations': 'My Reservations',
    'nav.user_fallback': 'User',
    // Profile page
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your personal information and access',
    'profile.photo': 'Profile photo',
    'profile.change_photo': 'Change photo',
    'profile.photo_hint': 'JPG, PNG, WebP · max 3 MB',
    'profile.photo_size_error': 'Image cannot exceed 3 MB.',
    'profile.photo_type_error': 'Only images are allowed.',
    'profile.personal_info': 'Personal information',
    'profile.email_readonly': 'Email cannot be changed.',
    'profile.update_success': 'Profile updated successfully.',
    'profile.save': 'Save changes',
    'profile.saving': 'Saving...',
    'profile.change_password': 'Change password',
    'profile.new_password': 'New password',
    'profile.confirm_password': 'Confirm password',
    'profile.password_placeholder': 'Minimum 6 characters',
    'profile.repeat_password': 'Repeat password',
    'profile.password_min_error': 'Password must be at least 6 characters.',
    'profile.password_mismatch': 'Passwords do not match.',
    'profile.password_success': 'Password updated successfully.',
    'profile.updating': 'Updating...',
    'profile.update_password': 'Change password',
    // My reservations page
    'my_reservations.title': 'My Reservations',
    'my_reservations.subtitle': 'History of all your reservations',
    'my_reservations.new': '+ New reservation',
    'my_reservations.unknown_restaurant': 'Unknown restaurant',
    'my_reservations.confirmed': 'Confirmed',
    'my_reservations.cancelled': 'Cancelled',
    'my_reservations.pending': 'Pending',
    'my_reservations.view': 'View restaurant →',
    'my_reservations.edit': '✏️ Edit',
    'my_reservations.edit_title': 'Edit reservation',
    'my_reservations.people': 'People',
    'my_reservations.cancel': 'Cancel',
    'my_reservations.save': 'Save changes',
    'my_reservations.saving': 'Saving...',
    'my_reservations.empty': 'You have no reservations yet',
    'my_reservations.empty_hint':
      'Explore restaurants and make your first reservation',
    'my_reservations.explore': 'View restaurants',
    // Home sections
    'home.restaurants_title': 'Restaurants',
    'home.restaurants_subtitle': 'Discover where to book today',
    'home.popular_tab': '🔥 Popular',
    'home.nearby_tab': '📍 Near me',
    'home.no_restaurants': 'No restaurants available yet.',
    'home.detecting_location': 'Detecting your location...',
    'home.location_denied':
      'Location permission denied. Enable it in your browser.',
    'home.city_not_found': 'Could not detect your city.',
    'home.location_error': 'Error getting your location.',
    'home.no_nearby': 'No restaurants found in your city yet.',
    'home.showing_nearby': 'Showing restaurants in',
    'home.reservations_label': 'reservations',
    'home.view_all': 'View all restaurants →',
    'home.recent_title': 'My recent reservations',
    'home.recent_subtitle': 'Summary of your recent activity',
    'home.see_all': 'See all →',
    'home.no_recent': 'You have no reservations yet.',
    'home.explore': 'Explore restaurants →',
    'home.restaurant_fallback': 'Restaurant',
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.saving': 'Saving...',
    // Footer
    'footer.description':
      'The smart platform for restaurant reservations with immersive 360° views. Discover, explore and book your perfect table.',
    'footer.navigation': 'Navigation',
    'footer.legal': 'Legal',
    'footer.productOf': 'A product of Stoyko Boshnakov.',
    'footer.nav.home': 'Home',
    'footer.nav.restaurants': 'Restaurants',
    'footer.nav.blog': 'Blog',
    'footer.nav.cookiePolicy': 'Cookie Policy',
    FAQ: 'FAQ',
    'Terms of Service': 'Terms of Service',
    'Privacy / GDPR': 'Privacy / GDPR',
    'contact.title': 'Contact Us',
    'contact.send_message': 'Send us a message',
    'contact.rights.reserved': 'All rights reserved.',
    'contact.name': 'Your Name',
    'contact.email': 'Your Email',
    'contact.your.message': 'Your Message',
    'contact.send.message': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.message.success': 'Message sent successfully!',
    'contact.message.fill.fields': 'Please fill all fields correctly.',
    // Dashboard Restaurant
    "dashboard.panel": "Panel",
    "dashboard.my_restaurant": "My Restaurant",
    "dashboard.reservations": "Reservations",
    // FAQ
    'faq.q1': 'What is TableView360?',
    'faq.a1':
      'TableView360 is a restaurant reservation platform that offers immersive 360° views so you can explore the venue before booking.',
    'faq.q2': 'How do I make a reservation?',
    'faq.a2':
      'Sign up as a client, browse available restaurants, choose your table, and select your preferred date and time.',
    'faq.q3': 'Is TableView360 free to use?',
    'faq.a3':
      'Yes, signing up and making reservations is completely free for clients.',
    'faq.q4': 'How can I register my restaurant?',
    'faq.a4':
      'Create an account selecting the "Restaurant" type during registration. Then you can manage your venue from the dashboard.',
    // Terms
    'terms.section1_title': '1. Acceptance of Terms',
    'terms.section1_body':
      'By accessing and using TableView360, you agree to be bound by these terms of service. If you do not agree with any part, you should not use the platform.',
    'terms.section2_title': '2. Use of Service',
    'terms.section2_body':
      'You agree to use the platform responsibly, not create fake accounts, and respect the reservation policies of each restaurant.',
    'terms.section3_title': '3. Reservations and Cancellations',
    'terms.section3_body':
      "Reservations made through TableView360 are subject to availability and each restaurant's policies. Cancel in advance to avoid penalties.",
    // Privacy
    'privacy.section1_title': '1. Data We Collect',
    'privacy.section1_body':
      'We collect your name, email, phone, and reservation data to provide the service. We do not sell your data to third parties.',
    'privacy.section2_title': '2. Your Rights (GDPR)',
    'privacy.section2_body':
      'You have the right to access, rectify, delete, and export your personal data at any time. Contact us to exercise these rights.',
    'privacy.section3_title': '3. Cookies',
    'privacy.section3_body':
      'We use essential cookies for platform functionality and language preference cookies. We do not use advertising tracking cookies.',
    // Blog
    'blog.subtitle': 'News, tips and updates from TableView360.',
    'blog.comingSoon':
      "We're preparing amazing content for you. New articles are coming soon!",
  },
};

/** Return a translated string for the given key and language. */
export function t(key: string, lang: LangCode = defaultLang): string {
  return translations[lang]?.[key] ?? key;
}

/**
 * Prefix a path with the language code.
 * All paths include the lang segment (e.g. /en/restaurants, /es/restaurantes).
 */
export function localePath(path: string, lang: LangCode = defaultLang): string {
  const clean = path.replace(/^\/(en|es)(\/|$)/, '/');

  // 🔥 CLAVE: no prefijo para default
  if (lang === defaultLang) {
    return clean === '/' ? '/' : clean;
  }

  return `/${lang}${clean === '/' ? '' : clean}`;
}

/** Valid lang codes for generateStaticParams */
export const langCodes: LangCode[] = ['en', 'es'];
