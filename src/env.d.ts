/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    lang: 'en' | 'es';
    user: import('@supabase/supabase-js').User;
    role: string;
  }
}
