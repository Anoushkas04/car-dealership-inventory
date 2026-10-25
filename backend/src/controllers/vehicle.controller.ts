import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service';

export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicles = this.vehicleService.getAllVehicles();
      res.status(200).json({
        success: true,
        count: vehicles.length,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const vehicle = this.vehicleService.getVehicleById(id);
      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { make, model, category, price, quantity } = req.body;
      const vehicle = this.vehicleService.createVehicle({
        make,
        model,
        category,
        price,
        quantity,
      });
      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { make, model, category, price, quantity } = req.body;
      const vehicle = this.vehicleService.updateVehicle(id, {
        make,
        model,
        category,
        price,
        quantity,
      });
      res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      this.vehicleService.deleteVehicle(id);
      res.status(200).json({
        success: true,
        message: `Vehicle ${id} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { make, model, category, minPrice, maxPrice, search } = req.query;
      const vehicles = this.vehicleService.searchVehicles({
        make: make ? String(make) : undefined,
        model: model ? String(model) : undefined,
        category: category ? String(category) : undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        search: search ? String(search) : undefined,
      });
      res.status(200).json({
        success: true,
        count: vehicles.length,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  };
}
