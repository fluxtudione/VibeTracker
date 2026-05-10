import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../src/components/layout/SafeAreaWrapper';
import HabitList from '../../src/components/habits/HabitList';
import { useHabits } from '../../src/features/habits';
import { useAuth } from '../../src/features/auth';
import { useAddHabit } from '../../src/features/habits/hooks/useAddHabit';
import { useUpdateHabit } from '../../src/features/habits/hooks/useUpdateHabit';
import { useDeleteHabit } from '../../src/features/habits/hooks/useDeleteHabit';
import type { HabitWithLogs } from '../../src/types/habit.types';

// Emoji options for habit icon
const EMOJI_OPTIONS = [
  '💪', '📚', '🏃', '💧', '🧘',
  '✍️', '🎯', '💤', '🍎', '🎵',
];

// Color options for habit color
const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#EF4444',
  '#F59E0B', '#8B5CF6', '#EC4899',
];

type Frequency = 'daily' | 'weekly';

export default function HomeScreen() {
  const { habits, completedTodayIds, loading, error, refetch } = useHabits();
  const { user, signOut } = useAuth();
  const { addHabit, loading: addLoading, error: addError } = useAddHabit();
  const { updateHabitById, isUpdating } = useUpdateHabit();
  const { deleteHabitById, isDeleting } = useDeleteHabit();

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [nameError, setNameError] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState(EMOJI_OPTIONS[0]);
  const [editColor, setEditColor] = useState(COLOR_OPTIONS[0]);
  const [editFrequency, setEditFrequency] = useState<Frequency>('daily');
  const [editNameError, setEditNameError] = useState('');

  // Context menu (action sheet) state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuHabit, setContextMenuHabit] = useState<HabitWithLogs | null>(null);

  // --------------- Helpers ---------------

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  const resetAddForm = () => {
    setName('');
    setDescription('');
    setSelectedIcon(EMOJI_OPTIONS[0]);
    setSelectedColor(COLOR_OPTIONS[0]);
    setFrequency('daily');
    setNameError('');
  };

  const openEditModal = useCallback((habit: HabitWithLogs) => {
    setEditingHabit(habit);
    setEditName(habit.name);
    setEditDescription(habit.description || '');
    setEditIcon(habit.icon || EMOJI_OPTIONS[0]);
    setEditColor(habit.color || COLOR_OPTIONS[0]);
    setEditFrequency((habit.frequency as Frequency) || 'daily');
    setEditNameError('');
    setShowEditModal(true);
  }, []);

  const resetEditForm = () => {
    setEditingHabit(null);
    setEditName('');
    setEditDescription('');
    setEditIcon(EMOJI_OPTIONS[0]);
    setEditColor(COLOR_OPTIONS[0]);
    setEditFrequency('daily');
    setEditNameError('');
  };

  // --------------- Handlers ---------------

  const handleLogout = async () => {
    await signOut();
  };

  // Long press on a habit card — open context menu
  const handleLongPressHabit = (habit: HabitWithLogs) => {
    setContextMenuHabit(habit);
    setContextMenuVisible(true);
  };

  // Context menu: Edit
  const handleContextEdit = () => {
    setContextMenuVisible(false);
    if (contextMenuHabit) {
      openEditModal(contextMenuHabit);
    }
  };

  // Context menu: Delete
  const handleContextDelete = () => {
    setContextMenuVisible(false);
    if (!contextMenuHabit) return;
    const habitToDelete = contextMenuHabit;
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitToDelete.name}"? This will also remove all of its completion history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteHabitById(habitToDelete.id);
            if (success) {
              refetch();
            } else {
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          },
        },
      ],
    );
  };

  // Add — save
  const handleSave = async () => {
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

    if (!isValid) return;

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
      setShowAddModal(false);
      resetAddForm();
      refetch();
    }
  };

  // Edit — save
  const handleUpdateSave = async () => {
    let isValid = true;
    if (!editName.trim()) {
      setEditNameError('Habit name is required');
      isValid = false;
    } else if (editName.length > 50) {
      setEditNameError('Habit name must be less than 50 characters');
      isValid = false;
    } else {
      setEditNameError('');
    }

    if (!isValid || !editingHabit) return;

    const success = await updateHabitById(editingHabit.id, {
      name: editName.trim(),
      description: editDescription.trim() || null,
      icon: editIcon,
      color: editColor,
      frequency: editFrequency,
    });

    if (success) {
      setShowEditModal(false);
      resetEditForm();
      refetch();
    } else {
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

  // --------------- Render helpers ---------------

  const dailySelected = frequency === 'daily';
  const weeklySelected = frequency === 'weekly';

  const editDailySelected = editFrequency === 'daily';
  const editWeeklySelected = editFrequency === 'weekly';

  return (
    <SafeAreaWrapper>
      {/* Header */}
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">{getGreeting()}</Text>
          <Text className="text-sm text-gray-500 mt-1">{getFormattedDate()}</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View className="mx-4 my-2 p-3 bg-red-50 rounded-lg">
          <Text className="text-red-600 text-sm">{error}</Text>
          <TouchableOpacity onPress={refetch} className="mt-2">
            <Text className="text-red-600 font-semibold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Habit List */}
      <View className="flex-1">
        <HabitList
          habits={habits as HabitWithLogs[]}
          completedIds={Array.from(completedTodayIds)}
          loading={loading}
          onAddPress={() => {
            resetAddForm();
            setShowAddModal(true);
          }}
          onLongPressHabit={handleLongPressHabit}
        />
      </View>

      {/* FAB Button */}
      <TouchableOpacity
        onPress={() => {
          resetAddForm();
          setShowAddModal(true);
        }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg"
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* ==================== Context Menu Modal ==================== */}
      <Modal
        visible={contextMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setContextMenuVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setContextMenuVisible(false)}
        >
          <View style={styles.actionSheet}>
            <Text style={styles.actionSheetTitle}>
              {contextMenuHabit?.name || 'Habit'}
            </Text>

            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={handleContextEdit}
            >
              <Ionicons name="create-outline" size={20} color="#111827" />
              <Text style={styles.actionSheetButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={handleContextDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={[styles.actionSheetButtonText, { color: '#DC2626' }]}>
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionSheetButton, styles.actionSheetCancelButton]}
              onPress={() => setContextMenuVisible(false)}
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ==================== Add Habit Modal ==================== */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          {/* Modal Header */}
          <View
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Pressable
              onPress={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
              disabled={addLoading}
            >
              <Text style={{ color: '#2563EB', fontSize: 16 }}>Cancel</Text>
            </Pressable>
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '600' }}>
              New Habit
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              {/* Habit Name */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                  Name <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Enter habit name"
                  maxLength={50}
                  style={[
                    {
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#111827',
                      backgroundColor: 'white',
                    },
                    nameError ? { borderColor: '#DC2626' } : { borderColor: '#D1D5DB' },
                  ]}
                />
                {nameError ? (
                  <Text style={{ color: '#DC2626', fontSize: 14, marginTop: 4 }}>{nameError}</Text>
                ) : null}
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                  {name.length}/50
                </Text>
              </View>

              {/* Description */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optional description"
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#111827',
                    backgroundColor: 'white',
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Icon Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Icon
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => setSelectedIcon(emoji)}
                      style={[
                        {
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        selectedIcon === emoji
                          ? { backgroundColor: '#DBEAFE', borderWidth: 2, borderColor: '#2563EB' }
                          : { backgroundColor: '#F3F4F6' },
                      ]}
                    >
                      <Text style={{ fontSize: 24 }}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Color Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Color
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {COLOR_OPTIONS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        { width: 40, height: 40, borderRadius: 20, backgroundColor: color },
                        selectedColor === color
                          ? { borderWidth: 4, borderColor: '#111827' }
                          : {},
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Frequency Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Frequency
                </Text>
                <View style={{ flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4 }}>
                  <Pressable
                    onPress={() => setFrequency('daily')}
                    style={[
                      { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
                      dailySelected
                        ? {
                            backgroundColor: 'white',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 1,
                            elevation: 2,
                          }
                        : {},
                    ]}
                  >
                    <Text style={{ fontWeight: '500', color: dailySelected ? '#111827' : '#6B7280' }}>
                      Daily
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setFrequency('weekly')}
                    style={[
                      { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
                      weeklySelected
                        ? {
                            backgroundColor: 'white',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 1,
                            elevation: 2,
                          }
                        : {},
                    ]}
                  >
                    <Text style={{ fontWeight: '500', color: weeklySelected ? '#111827' : '#6B7280' }}>
                      Weekly
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Error Message */}
            {addError ? (
              <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8 }}>
                <Text style={{ color: '#DC2626', fontSize: 14 }}>{addError}</Text>
              </View>
            ) : null}

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={addLoading}
              style={{
                backgroundColor: '#2563EB',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>
                {addLoading ? 'Saving...' : 'Save Habit'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* ==================== Edit Habit Modal ==================== */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowEditModal(false);
          resetEditForm();
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          {/* Modal Header */}
          <View
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Pressable
              onPress={() => {
                setShowEditModal(false);
                resetEditForm();
              }}
              disabled={isUpdating(editingHabit?.id || '')}
            >
              <Text style={{ color: '#2563EB', fontSize: 16 }}>Cancel</Text>
            </Pressable>
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '600' }}>
              Edit Habit
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              {/* Habit Name */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                  Name <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={(text) => {
                    setEditName(text);
                    if (editNameError) setEditNameError('');
                  }}
                  placeholder="Enter habit name"
                  maxLength={50}
                  style={[
                    {
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#111827',
                      backgroundColor: 'white',
                    },
                    editNameError ? { borderColor: '#DC2626' } : { borderColor: '#D1D5DB' },
                  ]}
                />
                {editNameError ? (
                  <Text style={{ color: '#DC2626', fontSize: 14, marginTop: 4 }}>{editNameError}</Text>
                ) : null}
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                  {editName.length}/50
                </Text>
              </View>

              {/* Description */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
                  Description
                </Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Optional description"
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#111827',
                    backgroundColor: 'white',
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Icon Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Icon
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => setEditIcon(emoji)}
                      style={[
                        {
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        editIcon === emoji
                          ? { backgroundColor: '#DBEAFE', borderWidth: 2, borderColor: '#2563EB' }
                          : { backgroundColor: '#F3F4F6' },
                      ]}
                    >
                      <Text style={{ fontSize: 24 }}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Color Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Color
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {COLOR_OPTIONS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setEditColor(color)}
                      style={[
                        { width: 40, height: 40, borderRadius: 20, backgroundColor: color },
                        editColor === color
                          ? { borderWidth: 4, borderColor: '#111827' }
                          : {},
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Frequency Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Frequency
                </Text>
                <View style={{ flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4 }}>
                  <Pressable
                    onPress={() => setEditFrequency('daily')}
                    style={[
                      { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
                      editDailySelected
                        ? {
                            backgroundColor: 'white',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 1,
                            elevation: 2,
                          }
                        : {},
                    ]}
                  >
                    <Text style={{ fontWeight: '500', color: editDailySelected ? '#111827' : '#6B7280' }}>
                      Daily
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setEditFrequency('weekly')}
                    style={[
                      { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
                      editWeeklySelected
                        ? {
                            backgroundColor: 'white',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 1,
                            elevation: 2,
                          }
                        : {},
                    ]}
                  >
                    <Text style={{ fontWeight: '500', color: editWeeklySelected ? '#111827' : '#6B7280' }}>
                      Weekly
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleUpdateSave}
              disabled={isUpdating(editingHabit?.id || '')}
              style={{
                backgroundColor: '#2563EB',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>
                {isUpdating(editingHabit?.id || '') ? 'Saving...' : 'Update Habit'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  fab: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // safe area bottom inset
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 12,
  },
  actionSheetButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  actionSheetCancelButton: {
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#F3F4F6',
  },
  actionSheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
});
