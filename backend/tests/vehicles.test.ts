import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { initDatabase, closeDatabase } from '../src/db/database';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, 'test_vehicles.sqlite');

describe('Vehicles API (TDD)', () => {
  let app: any;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
    const db = initDatabase(TEST_DB_PATH);
    app = createApp(db);

    // Register a standard user
    const userReg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'customer1', password: 'password123' });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'customer1', password: 'password123' });
    userToken = userLogin.body.data.token;

    // Register an admin user
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin1', password: 'adminpass123', role: 'admin' });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'adminpass123' });
    adminToken = adminLogin.body.data.token;
  });

  afterAll(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
  });

  describe('Authentication and Authorization Middleware', () => {
    it('should reject requests without Authorization header (401)', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token required|unauthorized/i);
    });

    it('should reject requests with invalid token (401)', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', 'Bearer invalid-token-string');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/vehicles', () => {
    it('should create a vehicle with unique id and valid properties (201)', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          price: 26000,
          quantity: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.make).toBe('Toyota');
      expect(res.body.data.model).toBe('Camry');
      expect(res.body.data.category).toBe('Sedan');
      expect(res.body.data.price).toBe(26000);
      expect(res.body.data.quantity).toBe(5);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Tesla',
          // missing model, category, price, quantity
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if price is negative or quantity is negative', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Honda',
          model: 'Civic',
          category: 'Sedan',
          price: -500,
          quantity: -2,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return all available vehicles', async () => {
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Ford',
          model: 'Mustang',
          category: 'Coupe',
          price: 45000,
          quantity: 3,
        });

      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'BMW',
          model: 'X5',
          category: 'SUV',
          price: 65000,
          quantity: 2,
        });

      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update a vehicle details', async () => {
      const createRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Audi',
          model: 'A4',
          category: 'Sedan',
          price: 40000,
          quantity: 4,
        });

      const vehicleId = createRes.body.data.id;

      const updateRes = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 42000,
          quantity: 6,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.price).toBe(42000);
      expect(updateRes.body.data.quantity).toBe(6);
      expect(updateRes.body.data.make).toBe('Audi'); // Unchanged field remains
    });

    it('should return 404 for non-existent vehicle id', async () => {
      const res = await request(app)
        .put('/api/vehicles/non-existent-id-999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 30000 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id (Admin only)', () => {
    it('should return 403 Forbidden when standard user attempts to delete a vehicle', async () => {
      const createRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Chevrolet',
          model: 'Tahoe',
          category: 'SUV',
          price: 55000,
          quantity: 1,
        });

      const vehicleId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body.message).toMatch(/admin privileges required/i);
    });

    it('should allow admin to delete a vehicle (200)', async () => {
      const createRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Chevrolet',
          model: 'Tahoe',
          category: 'SUV',
          price: 55000,
          quantity: 1,
        });

      const vehicleId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify it no longer appears in GET /api/vehicles
      const listRes = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.body.data.find((v: any) => v.id === vehicleId)).toBeUndefined();
    });

    it('should return 404 if admin tries to delete a non-existent vehicle', async () => {
      const res = await request(app)
        .delete('/api/vehicles/unknown-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
