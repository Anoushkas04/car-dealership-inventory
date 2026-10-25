import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { initDatabase, closeDatabase } from '../src/db/database';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, 'test_inventory.sqlite');

describe('Inventory API (TDD) - Purchase & Restock', () => {
  let app: any;
  let userToken: string;
  let adminToken: string;
  let inStockVehicleId: string;
  let outOfStockVehicleId: string;

  beforeEach(async () => {
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
    const db = initDatabase(TEST_DB_PATH);
    app = createApp(db);

    // Register user
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'buyer1', password: 'password123' });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'buyer1', password: 'password123' });
    userToken = userLogin.body.data.token;

    // Register admin
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'dealer_admin', password: 'password123', role: 'admin' });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'dealer_admin', password: 'password123' });
    adminToken = adminLogin.body.data.token;

    // Create an in-stock vehicle (quantity: 2)
    const inStockRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Mazda',
        model: 'CX-5',
        category: 'SUV',
        price: 29000,
        quantity: 2,
      });
    inStockVehicleId = inStockRes.body.data.id;

    // Create an out-of-stock vehicle (quantity: 0)
    const outStockRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Hyundai',
        model: 'Elantra',
        category: 'Sedan',
        price: 21000,
        quantity: 0,
      });
    outOfStockVehicleId = outStockRes.body.data.id;
  });

  afterAll(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should require authentication (401)', async () => {
      const res = await request(app).post(`/api/vehicles/${inStockVehicleId}/purchase`);
      expect(res.status).toBe(401);
    });

    it('should purchase a vehicle successfully and decrease quantity by 1 (200)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${inStockVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(1); // 2 -> 1
      expect(res.body.message).toMatch(/purchased successfully/i);

      // Verify persistence by fetching vehicle directly
      const fetchRes = await request(app)
        .get(`/api/vehicles/${inStockVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(fetchRes.body.data.quantity).toBe(1);
    });

    it('should return 400 when attempting to purchase an out-of-stock vehicle', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/out of stock/i);
    });

    it('should return 404 when attempting to purchase a non-existent vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles/non-existent-id/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/vehicles/:id/restock (Admin only)', () => {
    it('should require authentication (401)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/restock`)
        .send({ quantity: 5 });

      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden when standard user attempts to restock', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/admin privileges required/i);
    });

    it('should allow admin to restock a vehicle and increase its quantity (200)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(10); // 0 + 10 = 10
      expect(res.body.message).toMatch(/restocked successfully/i);

      // Subsequent restock accumulates
      const secondRestock = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(secondRestock.body.data.quantity).toBe(15);
    });

    it('should return 400 if restock quantity is missing, non-positive, or not an integer', async () => {
      const res1 = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -3 });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 });
      expect(res2.status).toBe(400);

      const res3 = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 'invalid' });
      expect(res3.status).toBe(400);
    });

    it('should return 404 if restock target does not exist', async () => {
      const res = await request(app)
        .post('/api/vehicles/non-existent-id/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(404);
    });
  });
});
