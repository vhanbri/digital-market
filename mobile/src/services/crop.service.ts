import { supabase } from '../lib/supabase';
import type { Crop } from '../types';

const PAGE_SIZE = 20;

export async function getCrops(page = 1, search?: string): Promise<{ crops: Crop[]; total: number }> {
  let query = supabase
    .from('crops')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { crops: (data ?? []) as Crop[], total: count ?? 0 };
}

export async function getCropById(id: string): Promise<Crop> {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Crop;
}
