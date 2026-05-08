/**
 * Environment variables configuration
 * Reads from process.env and validates required variables
 */

const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const SUPABASE_URL = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// Optional: export a config object
export const env = {
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
} as const;
