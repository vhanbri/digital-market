export interface Crop {
  id: string;
  farmer_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  harvest_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCropDTO {
  name: string;
  price: number;
  quantity: number;
  harvest_date?: string;
  description?: string;
}

export interface UpdateCropDTO {
  name?: string;
  price?: number;
  quantity?: number;
  harvest_date?: string;
  description?: string;
}
