import { supabase } from '../lib/supabase';
import type { User, UserRole, Order, OrderWithItems, OrderStatus } from '../types';
import { updateOrderStatus } from './order.service';
import { getCrops, createCrop, updateCrop, deleteCrop } from './crop.service';

export async function getUsers(role?: UserRole): Promise<User[]> {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (role) {
    query = query.eq('role', role);
  }
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
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getAdminOrders(): Promise<(Order & { buyer_name?: string })[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const buyerIds = [...new Set((orders ?? []).map((o) => o.buyer_id))];
  if (buyerIds.length === 0) return (orders ?? []) as (Order & { buyer_name?: string })[];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', buyerIds);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  return (orders ?? []).map((o) => ({
    ...o,
    buyer_name: nameMap.get(o.buyer_id) ?? undefined,
  })) as (Order & { buyer_name?: string })[];
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
    .select('*, crops(name)')
    .eq('order_id', id);

  if (itemsError) throw new Error(itemsError.message);

  return {
    ...order,
    items: items ?? [],
  } as OrderWithItems;
}

export { updateOrderStatus } from './order.service';

export async function getAdminCrops(limit = 50, offset = 0) {
  return getCrops({ limit, offset });
}

export async function createAdminCrop(data: {
  name: string;
  price: number;
  quantity: number;
  harvest_date?: string;
  description?: string;
  image_url?: string;
}) {
  return createCrop(data);
}

export async function updateAdminCrop(
  id: string,
  data: {
    name?: string;
    price?: number;
    quantity?: number;
    harvest_date?: string;
    description?: string;
    image_url?: string;
  },
) {
  return updateCrop(id, data);
}

export async function deleteAdminCrop(id: string): Promise<void> {
  return deleteCrop(id);
}

export interface AdminStats {
  totalUsers: number;
  farmers: number;
  buyers: number;
  totalOrders: number;
  pendingOrders: number;
  totalCrops: number;
  totalRevenue: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    { count: totalUsers },
    { count: farmers },
    { count: buyers },
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalCrops },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('crops').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total_price').in('status', ['accepted', 'delivered']),
  ]);

  const totalRevenue = (revenueData ?? []).reduce(
    (sum: number, o: { total_price: number }) => sum + Number(o.total_price),
    0,
  );

  return {
    totalUsers: totalUsers ?? 0,
    farmers: farmers ?? 0,
    buyers: buyers ?? 0,
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalCrops: totalCrops ?? 0,
    totalRevenue,
  };
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}
