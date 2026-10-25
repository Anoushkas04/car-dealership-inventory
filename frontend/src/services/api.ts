import { Vehicle, VehicleFormData, User } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async register(username: string, password: string, role?: string): Promise<{ success: boolean; data: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });
    return handleResponse(res);
  },

  async login(username: string, password: string): Promise<{ success: boolean; data: { token: string; user: User } }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  // Vehicles
  async getAllVehicles(): Promise<{ success: boolean; count: number; data: Vehicle[] }> {
    const res = await fetch(`${API_BASE}/vehicles`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async searchVehicles(params: {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<{ success: boolean; count: number; data: Vehicle[] }> {
    const query = new URLSearchParams();
    if (params.make) query.set('make', params.make);
    if (params.model) query.set('model', params.model);
    if (params.category) query.set('category', params.category);
    if (params.minPrice !== undefined && !isNaN(params.minPrice)) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) query.set('maxPrice', String(params.maxPrice));
    if (params.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/vehicles/search?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async createVehicle(payload: VehicleFormData): Promise<{ success: boolean; message: string; data: Vehicle }> {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateVehicle(
    id: string,
    payload: Partial<VehicleFormData>
  ): Promise<{ success: boolean; message: string; data: Vehicle }> {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteVehicle(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async purchaseVehicle(id: string): Promise<{ success: boolean; message: string; data: Vehicle }> {
    const res = await fetch(`${API_BASE}/vehicles/${id}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({}),
    });
    return handleResponse(res);
  },

  async restockVehicle(id: string, quantity: number): Promise<{ success: boolean; message: string; data: Vehicle }> {
    const res = await fetch(`${API_BASE}/vehicles/${id}/restock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(res);
  },
};
