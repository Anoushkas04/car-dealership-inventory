import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  purchase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const quantity = req.body?.quantity;
      const count = quantity !== undefined && !isNaN(Number(quantity)) ? Number(quantity) : 1;
      const updatedVehicle = this.inventoryService.purchaseVehicle(id, count);

      res.status(200).json({
        success: true,
        message: `Vehicle ${updatedVehicle.make} ${updatedVehicle.model} purchased successfully`,
        data: updatedVehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  restock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const quantity = req.body?.quantity;
      const updatedVehicle = this.inventoryService.restockVehicle(id, Number(quantity));

      res.status(200).json({
        success: true,
        message: `Vehicle ${updatedVehicle.make} ${updatedVehicle.model} restocked successfully`,
        data: updatedVehicle,
      });
    } catch (error) {
      next(error);
    }
  };
}
