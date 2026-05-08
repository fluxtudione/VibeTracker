import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser } from '../../../types/user.types';
import type { AuthContextType, AuthState } from '../types';
import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, onAuthStateChange } from '../../../services/supabase/auth.service';
import type { AuthResult } from '../types';

// Initial auth state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
};

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  signIn: async () => ({ data: null, error: null, success: false }),
  signUp: async () => ({ data: null, error: null, success: false }),
  signOut: async () => ({ data: null, error: null, success: false }),
});

// AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult<AuthUser>> => {
    const result = await supabaseSignIn(email, password);
    return result;
  }, []);

  // Sign up function
  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult<AuthUser>> => {
    const result = await supabaseSignUp(email, password);
    return result;
  }, []);

  // Sign out function
  const signOut = useCallback(async (): Promise<AuthResult> => {
    const result = await supabaseSignOut();
    if (result.success) {
      setState((prev) => ({ ...prev, user: null, session: null }));
    }
    return result;
  }, []);

  // Set up auth state listener
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await (await import('../../../services/supabase/client')).supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        setState((prev) => ({
          ...prev,
          session: session || null,
          user: session?.user
            ? {
                id: session.user.id,
                email: session.user.email ?? null,
                emailConfirmed: session.user.email_confirmed_at !== null,
              }
            : null,
          loading: false,
        }));
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setState((prev) => ({
        ...prev,
        user,
        session: user ? prev.session : null,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Context value
  const value: AuthContextType = {
    user: state.user,
    session: state.session,
    loading: state.loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
