import { useEffect } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/features/auth';
import { ROUTES } from '../src/lib/constants';

// Import CSS for NativeWind v4
import '../global.css';

// Root layout with auth protection
function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace(ROUTES.LOGIN as any);
    } else if (session && !inTabsGroup) {
      // Redirect to home if authenticated and not in tabs group
      router.replace(ROUTES.HOME as any);
    }
  }, [session, loading, segments]);

  if (loading) {
    return null; // Or a loading screen component
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
