import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { initDatabase, closeDatabase } from '../src/db/database';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, 'test_search.sqlite');

describe('Search API (TDD) - GET /api/vehicles/search', () => {
  let app: any;
  let token: string;

  beforeEach(async () => {
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
    const db = initDatabase(TEST_DB_PATH);
    app = createApp(db);

    // Register & Login user
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'searcher', password: 'password123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'searcher', password: 'password123' });
    token = loginRes.body.data.token;

    // Seed test vehicles
    const vehiclesToSeed = [
      { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 4 },
      { make: 'Honda', model: 'CR-V', category: 'SUV', price: 32000, quantity: 2 },
      { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 34000, quantity: 5 },
      { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 3 },
      { make: 'Porsche', model: '911', category: 'Coupe', price: 110000, quantity: 1 },
      { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 38000, quantity: 0 },
    ];

    for (const v of vehiclesToSeed) {
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send(v);
    }
  });

  afterAll(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
  });

  it('should require authentication token (401)', async () => {
    const res = await request(app).get('/api/vehicles/search?make=Honda');
    expect(res.status).toBe(401);
  });

  it('should filter vehicles by make (case-insensitive)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=honda')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every((v: any) => v.make === 'Honda')).toBe(true);
  });

  it('should filter vehicles by model (case-insensitive)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?model=civic')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].model).toBe('Civic');
  });

  it('should filter vehicles by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every((v: any) => v.category === 'SUV')).toBe(true);
  });

  it('should filter vehicles within a price range (minPrice and maxPrice)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=30000&maxPrice=40000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Should include CR-V (32000), RAV4 (34000), Model 3 (38000)
    expect(res.body.data.length).toBe(3);
    res.body.data.forEach((v: any) => {
      expect(v.price).toBeGreaterThanOrEqual(30000);
      expect(v.price).toBeLessThanOrEqual(40000);
    });
  });

  it('should filter vehicles by minPrice only', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=50000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].model).toBe('911');
  });

  it('should combine multiple filters (e.g. category=Sedan and maxPrice=30000)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=Sedan&maxPrice=30000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].model).toBe('Civic');
  });

  it('should return empty list when no vehicles match query', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Ferrari')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('should support unified text search across make, model, or category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?search=truck')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].model).toBe('F-150');
  });
});
