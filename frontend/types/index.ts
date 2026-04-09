export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  farmer_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  harvest_date: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCrops {
  crops: Crop[];
  total: number;
  limit: number;
  offset: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'delivered';

export interface Order {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total_price: number;
  delivery_name: string | null;
  delivery_address: string | null;
  delivery_phone: string | null;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  crop_id: string;
  quantity: number;
  price: number;
  crops?: { name: string };
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
