/* global console */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'tableview360-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function fetchReservations() {
  const { data, error } = await supabase.from('reservations').select('*');
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return [];
  }
  return data;
}

export async function addReservation(reservation) {
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservation]);
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return null;
  }
  return data;
}
