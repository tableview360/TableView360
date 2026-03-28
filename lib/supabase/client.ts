'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicEnv } from './env';
let supabaseBrowserSingleton: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowser() {
  if (supabaseBrowserSingleton) {
    return supabaseBrowserSingleton;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  supabaseBrowserSingleton = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return supabaseBrowserSingleton;
}