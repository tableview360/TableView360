import { createSupabaseServer } from '@/lib/supabase/server';

export async function fetchReservations() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}