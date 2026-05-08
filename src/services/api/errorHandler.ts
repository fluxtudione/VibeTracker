/**
 * Handles Supabase errors and returns user-friendly error messages
 */

// Supabase error type (based on @supabase/supabase-js error structure)
interface SupabaseError {
  message: string;
  status?: number;
  code?: string;
  details?: string;
  hint?: string;
}

// Generic error type for catch blocks
type UnknownError = Error | SupabaseError | unknown;

/**
 * Handles Supabase-specific errors and returns user-friendly messages
 */
export function handleSupabaseError(error: UnknownError): string {
  // If error is null or undefined
  if (!error) {
    return 'An unknown error occurred';
  }

  // If error is a string
  if (typeof error === 'string') {
    return error;
  }

  // If error is an Error object
  if (error instanceof Error) {
    return handleErrorMessage(error.message);
  }

  // If error is a Supabase error object
  if (typeof error === 'object' && error !== null) {
    const supabaseError = error as SupabaseError;

    // Try to get message from various possible properties
    if (supabaseError.message) {
      return handleErrorMessage(supabaseError.message);
    }

    if (supabaseError.details) {
      return handleErrorMessage(supabaseError.details);
    }

    if (supabaseError.hint) {
      return handleErrorMessage(supabaseError.hint);
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Maps common Supabase error messages to user-friendly messages
 */
function handleErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Authentication errors
  if (lowerMessage.includes('invalid login credentials') || 
      lowerMessage.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }

  if (lowerMessage.includes('user already registered') || 
      lowerMessage.includes('user already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (lowerMessage.includes('password should be at least')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  if (lowerMessage.includes('unable to validate email address')) {
    return 'Please enter a valid email address.';
  }

  if (lowerMessage.includes('signup is disabled')) {
    return 'New registrations are currently disabled. Please contact support.';
  }

  // Network errors
  if (lowerMessage.includes('network') || 
      lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('timeout')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Session errors
  if (lowerMessage.includes('session') && lowerMessage.includes('expired')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (lowerMessage.includes('session not found')) {
    return 'No active session found. Please sign in.';
  }

  // Rate limiting
  if (lowerMessage.includes('rate limit') || 
      lowerMessage.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  // Default: return the original message if it's user-friendly, or a generic message
  if (message.length < 100 && !lowerMessage.includes('error') && !lowerMessage.includes('exception')) {
    return message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Type guard to check if error is a Supabase error
 */
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}
