import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600';
      case 'secondary':
        return 'bg-gray-200';
      case 'outline':
        return 'border border-blue-600 bg-transparent';
      default:
        return 'bg-blue-600';
    }
  };

  const textColorClass = variant === 'outline' ? 'text-blue-600' : 'text-white';
  const baseClasses = 'px-4 py-3 rounded-lg flex-row justify-center items-center';
  const disabledClasses = disabled ? 'opacity-50 pointer-events-none' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${getVariantClasses()} ${disabledClasses} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#3B82F6' : 'white'}
          className="mr-2"
        />
      ) : null}
      <Text className={`font-medium ${textColorClass}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
