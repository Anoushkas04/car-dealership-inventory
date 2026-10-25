import { DatabaseSync } from 'node:sqlite';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, VehicleSearchParams } from '../models/vehicle';

export class VehicleRepository {
  constructor(private db: DatabaseSync) {}

  findAll(): Vehicle[] {
    const stmt = this.db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC');
    return stmt.all() as unknown as Vehicle[];
  }

  findById(id: string): Vehicle | null {
    const stmt = this.db.prepare('SELECT * FROM vehicles WHERE id = ?');
    const row = stmt.get(id) as unknown as Vehicle | undefined;
    return row || null;
  }

  create(vehicle: Vehicle): Vehicle {
    const stmt = this.db.prepare(`
      INSERT INTO vehicles (id, make, model, category, price, quantity, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      vehicle.id,
      vehicle.make,
      vehicle.model,
      vehicle.category,
      vehicle.price,
      vehicle.quantity,
      vehicle.created_at,
      vehicle.updated_at
    );
    return vehicle;
  }

  update(id: string, partial: UpdateVehicleDto, updatedAt: string): Vehicle | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: Vehicle = {
      ...existing,
      make: partial.make !== undefined ? partial.make : existing.make,
      model: partial.model !== undefined ? partial.model : existing.model,
      category: partial.category !== undefined ? partial.category : existing.category,
      price: partial.price !== undefined ? partial.price : existing.price,
      quantity: partial.quantity !== undefined ? partial.quantity : existing.quantity,
      updated_at: updatedAt,
    };

    const stmt = this.db.prepare(`
      UPDATE vehicles
      SET make = ?, model = ?, category = ?, price = ?, quantity = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      updated.make,
      updated.model,
      updated.category,
      updated.price,
      updated.quantity,
      updated.updated_at,
      id
    );

    return updated;
  }

  delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;

    const stmt = this.db.prepare('DELETE FROM vehicles WHERE id = ?');
    stmt.run(id);
    return true;
  }

  search(params: VehicleSearchParams): Vehicle[] {
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const values: (string | number)[] = [];

    if (params.make) {
      query += ' AND LOWER(make) LIKE ?';
      values.push(`%${params.make.toLowerCase()}%`);
    }

    if (params.model) {
      query += ' AND LOWER(model) LIKE ?';
      values.push(`%${params.model.toLowerCase()}%`);
    }

    if (params.category) {
      query += ' AND LOWER(category) = ?';
      values.push(params.category.toLowerCase());
    }

    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
      query += ' AND price >= ?';
      values.push(params.minPrice);
    }

    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      query += ' AND price <= ?';
      values.push(params.maxPrice);
    }

    if (params.search) {
      query += ' AND (LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(category) LIKE ?)';
      const term = `%${params.search.toLowerCase()}%`;
      values.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...values) as unknown as Vehicle[];
  }
}
