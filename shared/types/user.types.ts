export type UserRole = 'farmer' | 'buyer' | 'admin';

/** Full database row — never expose password_hash beyond the repository layer. */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  location: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Public-safe user object (no credentials). */
export type User = Omit<UserRow, 'password_hash'>;

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  location?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'created_at' | 'updated_at'>;
}
