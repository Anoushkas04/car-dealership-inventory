import { VehicleRepository } from '../repositories/vehicle.repository';
import { Vehicle } from '../models/vehicle';

export class InventoryService {
  constructor(private vehicleRepo: VehicleRepository) {}

  purchaseVehicle(id: string, count: number = 1): Vehicle {
    const vehicle = this.vehicleRepo.findById(id);
    if (!vehicle) {
      const err: any = new Error(`Vehicle with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    if (vehicle.quantity <= 0) {
      const err: any = new Error(`Vehicle ${vehicle.make} ${vehicle.model} is out of stock`);
      err.statusCode = 400;
      throw err;
    }

    if (vehicle.quantity < count) {
      const err: any = new Error(`Insufficient stock. Available: ${vehicle.quantity}, requested: ${count}`);
      err.statusCode = 400;
      throw err;
    }

    const updated = this.vehicleRepo.update(
      id,
      { quantity: vehicle.quantity - count },
      new Date().toISOString()
    );

    return updated!;
  }

  restockVehicle(id: string, quantity: number): Vehicle {
    if (
      quantity === undefined ||
      typeof quantity !== 'number' ||
      isNaN(quantity) ||
      quantity <= 0 ||
      !Number.isInteger(quantity)
    ) {
      const err: any = new Error('Restock quantity must be a positive integer greater than 0');
      err.statusCode = 400;
      throw err;
    }

    const vehicle = this.vehicleRepo.findById(id);
    if (!vehicle) {
      const err: any = new Error(`Vehicle with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    const updated = this.vehicleRepo.update(
      id,
      { quantity: vehicle.quantity + quantity },
      new Date().toISOString()
    );

    return updated!;
  }
}
