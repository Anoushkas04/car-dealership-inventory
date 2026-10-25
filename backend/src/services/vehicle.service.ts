import { v4 as uuidv4 } from 'uuid';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, VehicleSearchParams } from '../models/vehicle';

export class VehicleService {
  constructor(private vehicleRepo: VehicleRepository) {}

  getAllVehicles(): Vehicle[] {
    return this.vehicleRepo.findAll();
  }

  getVehicleById(id: string): Vehicle {
    const vehicle = this.vehicleRepo.findById(id);
    if (!vehicle) {
      const err: any = new Error(`Vehicle with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return vehicle;
  }

  createVehicle(data: CreateVehicleDto): Vehicle {
    const { make, model, category, price, quantity } = data;

    if (!make || typeof make !== 'string' || !make.trim()) {
      const err: any = new Error('Vehicle make is required');
      err.statusCode = 400;
      throw err;
    }
    if (!model || typeof model !== 'string' || !model.trim()) {
      const err: any = new Error('Vehicle model is required');
      err.statusCode = 400;
      throw err;
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      const err: any = new Error('Vehicle category is required');
      err.statusCode = 400;
      throw err;
    }
    if (price === undefined || typeof price !== 'number' || isNaN(price) || price < 0) {
      const err: any = new Error('Price must be a valid positive number or zero');
      err.statusCode = 400;
      throw err;
    }
    if (quantity === undefined || typeof quantity !== 'number' || isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      const err: any = new Error('Quantity must be a valid non-negative integer');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      id: uuidv4(),
      make: make.trim(),
      model: model.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      created_at: now,
      updated_at: now,
    };

    return this.vehicleRepo.create(newVehicle);
  }

  updateVehicle(id: string, data: UpdateVehicleDto): Vehicle {
    const existing = this.getVehicleById(id);

    if (data.price !== undefined) {
      if (typeof data.price !== 'number' || isNaN(data.price) || data.price < 0) {
        const err: any = new Error('Price must be a valid non-negative number');
        err.statusCode = 400;
        throw err;
      }
    }

    if (data.quantity !== undefined) {
      if (typeof data.quantity !== 'number' || isNaN(data.quantity) || data.quantity < 0 || !Number.isInteger(data.quantity)) {
        const err: any = new Error('Quantity must be a non-negative integer');
        err.statusCode = 400;
        throw err;
      }
    }

    const updated = this.vehicleRepo.update(id, data, new Date().toISOString());
    if (!updated) {
      const err: any = new Error(`Vehicle with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }

  deleteVehicle(id: string): void {
    const success = this.vehicleRepo.delete(id);
    if (!success) {
      const err: any = new Error(`Vehicle with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
  }

  searchVehicles(params: VehicleSearchParams): Vehicle[] {
    return this.vehicleRepo.search(params);
  }
}
