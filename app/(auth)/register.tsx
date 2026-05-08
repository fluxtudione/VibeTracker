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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateAuthForm(email, password);
    
    // Check confirm password
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email.trim(), password);

      if (!result.success) {
        // Handle Supabase error
        let errorMessage = 'An error occurred during registration';

        if (result.error) {
          const errorMsg = result.error.toLowerCase();
          if (errorMsg.includes('user already registered') || errorMsg.includes('already exists')) {
            errorMessage = 'An account with this email already exists';
          } else if (errorMsg.includes('password')) {
            errorMessage = 'Password is too weak or invalid';
          } else if (errorMsg.includes('please check your email')) {
            // Email confirmation required
            setErrors({ general: 'Check your email for confirmation link' });
            setLoading(false);
            return;
          } else {
            errorMessage = result.error;
          }
        }

        setErrors({ general: errorMessage });
      } else {
        // Success - check if email confirmation is needed
        // If signUp returns success: true, user is automatically logged in (no email confirmation)
        // Otherwise, they need to confirm email
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error) {
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
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
              Create Account
            </Text>
            <Text className="text-base text-gray-600">
              Sign up to start tracking your habits
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

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry
              editable={!loading}
            />

            {/* General Error Message */}
            {errors.general ? (
              <View className="mb-4 p-3 bg-red-50 rounded-lg">
                <Text className="text-red-600 text-sm">{errors.general}</Text>
              </View>
            ) : null}

            {/* Register Button */}
            <Button
              title="Sign Up"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              className="mt-2"
            />
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-base">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
              <Text className="text-blue-600 font-semibold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
