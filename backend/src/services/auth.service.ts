import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { UserRole, UserWithoutPassword } from '../models/user';

export const JWT_SECRET = process.env.JWT_SECRET || 'car-dealership-secret-key-2026';
export const JWT_EXPIRES_IN = '24h';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(data: {
    username?: string;
    password?: string;
    role?: string;
  }): Promise<UserWithoutPassword> {
    const { username, password, role = 'user' } = data;

    if (!username || typeof username !== 'string' || !username.trim()) {
      const err: any = new Error('Username is required');
      err.statusCode = 400;
      throw err;
    }

    if (!password || typeof password !== 'string') {
      const err: any = new Error('Password is required');
      err.statusCode = 400;
      throw err;
    }

    if (password.length < 6) {
      const err: any = new Error('Password must be at least 6 characters long');
      err.statusCode = 400;
      throw err;
    }

    const cleanRole: UserRole = role === 'admin' ? 'admin' : 'user';

    const existingUser = this.userRepo.findByUsername(username.trim());
    if (existingUser) {
      const err: any = new Error(`User with username '${username}' already exists`);
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const newUser = this.userRepo.create({
      id,
      username: username.trim(),
      password: hashedPassword,
      role: cleanRole,
      created_at: createdAt,
    });

    return {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      created_at: newUser.created_at,
    };
  }

  async login(data: {
    username?: string;
    password?: string;
  }): Promise<{ token: string; user: UserWithoutPassword }> {
    const { username, password } = data;

    if (!username || !password) {
      const err: any = new Error('Username and password are required');
      err.statusCode = 400;
      throw err;
    }

    const user = this.userRepo.findByUsername(username.trim());
    if (!user || !user.password) {
      const err: any = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err: any = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }
}
