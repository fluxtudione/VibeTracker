import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth';
import { useAddHabit } from '../../src/features/habits/hooks/useAddHabit';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Card from '../../src/components/ui/Card';

// Emoji options for habit icon
const EMOJI_OPTIONS = [
  '💪',
  '📚',
  '🏃',
  '💧',
  '🧘',
  '✍️',
  '🎯',
  '💤',
  '🍎',
  '🎵',
];

// Color options for habit color (from Design System + additional)
const COLOR_OPTIONS = [
  '#3B82F6', // Blue 600 (Primary)
  '#10B981', // Green 600 (Success)
  '#EF4444', // Red 600 (Error)
  '#F59E0B', // Yellow 500
  '#8B5CF6', // Purple 500
  '#EC4899', // Pink 500
];

// Frequency options
type Frequency = 'daily' | 'weekly';

export default function AddHabitScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addHabit, loading, error } = useAddHabit();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [nameError, setNameError] = useState('');

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Habit name is required');
      isValid = false;
    } else if (name.length > 50) {
      setNameError('Habit name must be less than 50 characters');
      isValid = false;
    } else {
      setNameError('');
    }

    return isValid;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a habit');
      return;
    }

    const habitData = {
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      icon: selectedIcon,
      color: selectedColor,
      frequency,
      is_active: true,
    };

    const success = await addHabit(habitData);

    if (success) {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row justify-between items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text className="text-blue-600 text-base">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-gray-900 text-lg font-semibold">New Habit</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          {/* Habit Name */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-1">
              Name <Text className="text-red-500">*</Text>
            </Text>
            <Input
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              placeholder="Enter habit name"
              maxLength={50}
              error={nameError}
            />
            <Text className="text-gray-400 text-xs mt-1 text-right">
              {name.length}/50
            </Text>
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-1">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          {/* Icon Picker */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Icon
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setSelectedIcon(emoji)}
                  className={`w-12 h-12 rounded-lg items-center justify-center ${
                    selectedIcon === emoji ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Picker */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Color
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full ${
                    selectedColor === color ? 'border-4 border-gray-900' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </View>

          {/* Frequency Picker */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Frequency
            </Text>
            <View className="flex-row bg-gray-100 rounded-lg p-1">
              <TouchableOpacity
                onPress={() => setFrequency('daily')}
                className={`flex-1 py-2 rounded-md items-center ${
                  frequency === 'daily' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text
                  className={`font-medium ${
                    frequency === 'daily' ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFrequency('weekly')}
                className={`flex-1 py-2 rounded-md items-center ${
                  frequency === 'weekly' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text
                  className={`font-medium ${
                    frequency === 'weekly' ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Error Message */}
        {error ? (
          <View className="mb-4 p-3 bg-red-50 rounded-lg">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Save Button */}
        <Button
          title="Save Habit"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          className="mb-4"
        />
      </ScrollView>
    </View>
  );
}
