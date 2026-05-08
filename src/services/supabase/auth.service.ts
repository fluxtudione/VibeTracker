import { supabase } from './client';
import type { AuthUser } from '../../types/user.types';
import { handleSupabaseError } from '../api/errorHandler';

// Type for auth response
export interface AuthResult<T = void> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  // Add additional fields if needed for profile creation
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false,
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: 'No user returned from authentication',
        success: false,
      };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email ?? null,
      emailConfirmed: data.user.email_confirmed_at !== null,
    };

    return {
      data: authUser,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false,
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: 'No user returned from registration',
        success: false,
      };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        data: null,
        error: 'Please check your email to confirm your account',
        success: false,
      };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email ?? null,
      emailConfirmed: data.user.email_confirmed_at !== null,
    };

    return {
      data: authUser,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

// Sign out the current user
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false,
      };
    }

    return {
      data: null,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

// Get the current session
export async function getSession(): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false,
      };
    }

    if (!data.session || !data.session.user) {
      return {
        data: null,
        error: null,
        success: true,
      };
    }

    const authUser: AuthUser = {
      id: data.session.user.id,
      email: data.session.user.email ?? null,
      emailConfirmed: data.session.user.email_confirmed_at !== null,
    };

    return {
      data: authUser,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

// Listen to auth state changes
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email ?? null,
        emailConfirmed: session.user.email_confirmed_at !== null,
      };
      callback(authUser);
    } else {
      callback(null);
    }
  });

  // Return unsubscribe function
  return () => {
    data.subscription.unsubscribe();
  };
}
