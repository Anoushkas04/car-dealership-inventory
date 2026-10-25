import path from 'path';
import fs from 'fs';

// Safely obtain native node:sqlite DatabaseSync without bundler conflicts
function getNativeDatabaseSync(): any {
  if (typeof (process as any).getBuiltinModule === 'function') {
    return (process as any).getBuiltinModule('node:sqlite').DatabaseSync;
  }
  const req = eval('require');
  return req('node:sqlite').DatabaseSync;
}

const DatabaseSync = getNativeDatabaseSync();

let dbInstance: any = null;

export const DEFAULT_DB_PATH = path.resolve(__dirname, '../../data/dealership.sqlite');

export function initDatabase(dbPath: string = DEFAULT_DB_PATH): any {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new DatabaseSync(dbPath);

  // Enable WAL mode for high performance concurrency and persistence
  dbInstance.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return dbInstance;
}

export function getDatabase(): any {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {}
    dbInstance = null;
  }
}
