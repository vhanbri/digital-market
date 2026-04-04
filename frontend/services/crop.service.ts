import { supabase } from '../lib/supabase';
import type { Crop, PaginatedCrops } from '../types';

interface CropFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export async function getCrops(filters?: CropFilters): Promise<PaginatedCrops> {
  const limit = filters?.limit ?? 20;
  const offset = filters?.offset ?? 0;

  let query = supabase
    .from('crops')
    .select('*', { count: 'exact' });

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    crops: (data ?? []) as Crop[],
    total: count ?? 0,
    limit,
    offset,
  };
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

export async function createCrop(payload: {
  name: string;
  price: number;
  quantity: number;
  harvest_date?: string;
  description?: string;
}): Promise<Crop> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('crops')
    .insert({
      farmer_id: user.id,
      name: payload.name,
      price: payload.price,
      quantity: payload.quantity,
      harvest_date: payload.harvest_date || null,
      description: payload.description || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Crop;
}

export async function updateCrop(
  id: string,
  payload: {
    name?: string;
    price?: number;
    quantity?: number;
    harvest_date?: string;
    description?: string;
  },
): Promise<Crop> {
  const updateData: Record<string, unknown> = {};
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.price !== undefined) updateData.price = payload.price;
  if (payload.quantity !== undefined) updateData.quantity = payload.quantity;
  if (payload.harvest_date !== undefined) updateData.harvest_date = payload.harvest_date || null;
  if (payload.description !== undefined) updateData.description = payload.description || null;

  const { data, error } = await supabase
    .from('crops')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Crop;
}

export async function deleteCrop(id: string): Promise<void> {
  const { error } = await supabase
    .from('crops')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
