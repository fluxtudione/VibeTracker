import type { AuthUser } from '../../types/user.types';
import type { Session } from '@supabase/supabase-js';

// Auth result type for auth operations
export interface AuthResult<T = void> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Auth state for context
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

// Auth context type
export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult<AuthUser>>;
  signUp: (email: string, password: string) => Promise<AuthResult<AuthUser>>;
  signOut: () => Promise<AuthResult>;
}
