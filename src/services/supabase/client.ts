import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/env';

// Supabase auth session tokens (JWTs + user metadata) routinely exceed
// Expo SecureStore's 2048-byte per-key limit. AsyncStorage is the
// recommended storage backend per the Supabase Expo / React Native docs:
//   https://supabase.com/docs/reference/javascript/initializing#react-native-options
//
// For non-auth sensitive values you may prefer SecureStore; the Supabase
// client only interacts with the `storage` adapter for its own auth keys.
const SupabaseStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SupabaseStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
