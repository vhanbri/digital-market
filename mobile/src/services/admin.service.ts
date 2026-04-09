import { supabase } from '../lib/supabase';
import type { User, UserRole, Order, OrderItem } from '../types';

export interface AdminStats {
  totalUsers: number;
  buyers: number;
  totalOrders: number;
  pendingOrders: number;
  totalCrops: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function getUsers(role?: UserRole): Promise<User[]> {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as User[];
}

export async function getUserById(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as User;
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getAdminOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function getAdminOrderById(id: string): Promise<OrderWithItems> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (orderError) throw new Error(orderError.message);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);
  if (itemsError) throw new Error(itemsError.message);

  return { ...order, items: items ?? [] } as OrderWithItems;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    { count: totalUsers },
    { count: buyers },
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalCrops },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('crops').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    buyers: buyers ?? 0,
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalCrops: totalCrops ?? 0,
  };
}
