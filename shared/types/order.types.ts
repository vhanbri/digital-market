export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'delivered';

export interface Order {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  crop_id: string;
  quantity: number;
  price: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderItemDTO {
  crop_id: string;
  quantity: number;
}

export interface CreateOrderDTO {
  items: CreateOrderItemDTO[];
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}
