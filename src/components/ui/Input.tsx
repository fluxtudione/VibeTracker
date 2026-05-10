import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface InputProps {
  label?: string;
  error?: string;
  secureTextEntry?: boolean | string;
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | string;
  editable?: boolean | string;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  secureTextEntry = false,
  className = '',
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  maxLength,
}) => {
  const hasError = !!error;
  const normalizedSecureTextEntry = secureTextEntry === true || secureTextEntry === 'true';
  const normalizedEditable = editable !== false && editable !== 'false';
  const normalizedKeyboardType =
    keyboardType === 'default' ||
    keyboardType === 'email-address' ||
    keyboardType === 'numeric' ||
    keyboardType === 'phone-pad'
      ? keyboardType
      : 'default';
  const normalizedAutoCapitalize =
    autoCapitalize === 'none' ||
    autoCapitalize === 'sentences' ||
    autoCapitalize === 'words' ||
    autoCapitalize === 'characters'
      ? autoCapitalize
      : 'sentences';

  console.log('Input props', {
    secureTextEntry,
    editable,
    keyboardType,
    autoCapitalize,
  });
  console.log('Input normalized props', {
    secureTextEntry: normalizedSecureTextEntry,
    editable: normalizedEditable,
    keyboardType: normalizedKeyboardType,
    autoCapitalize: normalizedAutoCapitalize,
  });

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={normalizedSecureTextEntry}
        keyboardType={normalizedKeyboardType}
        autoCapitalize={normalizedAutoCapitalize}
        editable={normalizedEditable}
        maxLength={maxLength}
        className={`border rounded-lg px-4 py-3 text-base text-gray-900 ${
          hasError ? 'border-red-600' : 'border-gray-300'
        } ${!normalizedEditable ? 'bg-gray-100' : 'bg-white'} ${className}`}
      />
      {hasError ? (
        <Text className="text-red-600 text-sm mt-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default Input;
