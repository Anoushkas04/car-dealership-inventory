export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  created_at?: string;
}

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

export interface VehicleFormData {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface SearchFilterState {
  search: string;
  category: string;
  make: string;
  minPrice: string;
  maxPrice: string;
}
