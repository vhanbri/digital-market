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

export async function createCrop(input: {
  name: string;
  price: number;
  quantity: number;
  harvest_date?: string;
  description?: string;
}): Promise<Crop> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('crops')
    .insert({ ...input, farmer_id: user!.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Crop;
}

export async function updateCrop(
  id: string,
  input: { name?: string; price?: number; quantity?: number; harvest_date?: string; description?: string },
): Promise<Crop> {
  const { data, error } = await supabase
    .from('crops')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Crop;
}

export async function deleteCrop(id: string): Promise<void> {
  const { error } = await supabase.from('crops').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
