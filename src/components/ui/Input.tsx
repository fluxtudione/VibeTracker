import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface InputProps {
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
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

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        maxLength={maxLength}
        className={`border rounded-lg px-4 py-3 text-base text-gray-900 ${
          hasError ? 'border-red-600' : 'border-gray-300'
        } ${!editable ? 'bg-gray-100' : 'bg-white'} ${className}`}
      />
      {hasError ? (
        <Text className="text-red-600 text-sm mt-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default Input;
