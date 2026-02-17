-- Añadir campo username a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Crear índice único para username (solo si no es null)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
ON public.profiles (username) 
WHERE username IS NOT NULL;

-- Crear índice único para email (solo si no es null)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique 
ON public.profiles (email) 
WHERE email IS NOT NULL;

-- Crear índice único para phone (solo si no es null)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique 
ON public.profiles (phone) 
WHERE phone IS NOT NULL;