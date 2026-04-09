import { supabase } from '../lib/supabase';
import type { Order, OrderWithItems, OrderStatus } from '../types';

export interface DeliveryInfo {
  name: string;
  address: string;
  phone: string;
  notes?: string;
}

export async function placeOrder(
  items: Array<{ crop_id: string; quantity: number }>,
  delivery: DeliveryInfo,
): Promise<OrderWithItems> {
  const { data, error } = await supabase.rpc('place_order', {
    p_items: items,
    p_delivery_name: delivery.name,
    p_delivery_address: delivery.address,
    p_delivery_phone: delivery.phone,
    p_delivery_notes: delivery.notes ?? null,
  });

  if (error) throw new Error(error.message);
  return data as OrderWithItems;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<OrderWithItems> {
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

  return {
    ...order,
    items: items ?? [],
  } as OrderWithItems;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const { data, error } = await supabase.rpc('admin_update_order_status', {
    p_order_id: id,
    p_status: status,
  });

  if (error) throw new Error(error.message);
  return data as Order;
}
