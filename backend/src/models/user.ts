export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  created_at: string;
}

export interface UserWithoutPassword {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface AuthTokenPayload {
  id: string;
  username: string;
  role: UserRole;
}
