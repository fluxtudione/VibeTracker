import type { Database } from './database.types';

// Types from generated database schema
export type UserProfile = Database['public']['Tables']['profiles']['Row'];

// Insert and Update types
export type NewUserProfile = Database['public']['Tables']['profiles']['Insert'];
export type UpdateUserProfile = Database['public']['Tables']['profiles']['Update'];

// Extended user type with auth data
export interface AuthUser {
  id: string;
  email: string | null;
  emailConfirmed: boolean;
}

// Combined user type with profile
export interface UserWithProfile extends AuthUser {
  profile?: UserProfile | null;
}
