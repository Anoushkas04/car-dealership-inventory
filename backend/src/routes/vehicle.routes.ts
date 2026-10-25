import { Router } from 'express';
import { DatabaseSync } from 'node:sqlite';
import { VehicleController } from '../controllers/vehicle.controller';
import { VehicleService } from '../services/vehicle.service';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

export function createVehicleRouter(db: DatabaseSync): Router {
  const router = Router();
  const vehicleRepo = new VehicleRepository(db);
  const vehicleService = new VehicleService(vehicleRepo);
  const vehicleController = new VehicleController(vehicleService);

  // All vehicle endpoints require authentication
  router.use(authMiddleware);

  // Search vehicles (must come before /:id)
  router.get('/search', vehicleController.search);

  // View all vehicles
  router.get('/', vehicleController.getAll);

  // View specific vehicle
  router.get('/:id', vehicleController.getById);

  // Add new vehicle
  router.post('/', vehicleController.create);

  // Update vehicle
  router.put('/:id', vehicleController.update);

  // Delete vehicle (Admin only)
  router.delete('/:id', requireAdmin, vehicleController.delete);

  return router;
}
