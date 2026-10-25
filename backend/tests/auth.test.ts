import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { initDatabase, closeDatabase, getDatabase } from '../src/db/database';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, 'test_auth.sqlite');

describe('Auth API (TDD)', () => {
  let app: any;

  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
    const db = initDatabase(TEST_DB_PATH);
    app = createApp(db);
  });

  afterAll(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {}
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new customer user and return 201 with user object (excluding password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'johndoe',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.username).toBe('johndoe');
      expect(res.body.data.role).toBe('user');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should register an admin user when role is admin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'adminuser',
          password: 'adminpassword',
          role: 'admin',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });

    it('should return 400 if username or password is missing', async () => {
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({ username: 'missingpass' });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ password: 'validpassword' });
      expect(res2.status).toBe(400);
    });

    it('should return 400 if password is less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'shortpassuser',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });

    it('should return 409 Conflict if username is already registered', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'password123',
        });

      const duplicate = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'differentpassword',
        });

      expect(duplicate.status).toBe(409);
      expect(duplicate.body.message).toMatch(/already exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          password: 'mypassword123',
        });
    });

    it('should login successfully with valid credentials and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'mypassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.username).toBe('loginuser');
      expect(res.body.data.user.role).toBe('user');
    });

    it('should return 401 when password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 401 when username does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 400 when missing username or password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
