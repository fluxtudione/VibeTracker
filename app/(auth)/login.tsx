import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { validateAuthForm } from '../../src/lib/validation';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import SafeAreaWrapper from '../../src/components/layout/SafeAreaWrapper';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateAuthForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);

      if (!result.success) {
        // Handle Supabase error
        let errorMessage = 'An error occurred during login';

        if (result.error) {
          const errorMsg = result.error.toLowerCase();
          if (errorMsg.includes('invalid login credentials')) {
            errorMessage = 'Invalid email or password';
          } else if (errorMsg.includes('email not confirmed')) {
            errorMessage = 'Please confirm your email address';
          } else if (errorMsg.includes('too many requests')) {
            errorMessage = 'Too many attempts. Please try again later';
          } else {
            errorMessage = result.error;
          }
        }

        setErrors({ general: errorMessage });
      }
      // Success: AuthContext will handle redirect automatically
    } catch (error) {
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600">
              Sign in to continue tracking your habits
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              editable={!loading}
            />

            {/* General Error Message */}
            {errors.general ? (
              <View className="mb-4 p-3 bg-red-50 rounded-lg">
                <Text className="text-red-600 text-sm">{errors.general}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              className="mt-2"
            />
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-base">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
              <Text className="text-blue-600 font-semibold text-base">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
