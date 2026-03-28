'use client';

import { createBrowserClient } from '@supabase/ssr';
let supabaseBrowserSingleton: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowser() {
  if (supabaseBrowserSingleton) {
    return supabaseBrowserSingleton;
  }

  supabaseBrowserSingleton = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return supabaseBrowserSingleton;
}