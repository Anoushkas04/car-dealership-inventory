export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
