import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../types';

interface PlaceOrderItem {
  crop_id: string;
  quantity: number;
}

export interface DeliveryInfo {
  name: string;
  address: string;
  phone: string;
  notes?: string;
}

export async function placeOrder(items: PlaceOrderItem[], delivery: DeliveryInfo): Promise<Order> {
  const { data, error } = await supabase.rpc('place_order', {
    p_items: items,
    p_delivery_name: delivery.name,
    p_delivery_address: delivery.address,
    p_delivery_phone: delivery.phone,
    p_delivery_notes: delivery.notes ?? null,
  });

  if (error) throw new Error(error.message);
  return data as Order;
}

export async function getMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw new Error(error.message);
  return (data ?? []) as OrderItem[];
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const { data, error } = await supabase.rpc('admin_update_order_status', {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
  return data as Order;
}
