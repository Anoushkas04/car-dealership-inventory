import { IDatabase } from '../types/db';
import { User } from '../models/user';

export class UserRepository {
  constructor(private db: IDatabase) {}

  findByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(username) as User | undefined;
    return row || null;
  }

  findById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as User | undefined;
    return row || null;
  }

  create(user: { id: string; username: string; password: string; role: string; created_at: string }): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, password, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(user.id, user.username, user.password, user.role, user.created_at);
    return {
      id: user.id,
      username: user.username,
      role: user.role as any,
      created_at: user.created_at,
    };
  }
}
