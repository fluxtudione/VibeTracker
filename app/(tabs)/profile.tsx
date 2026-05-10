import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../src/components/layout/SafeAreaWrapper';
import { useAuth } from '../../src/features/auth';
import { useHabits } from '../../src/features/habits';
import { useProfileStats } from '../../src/features/habits/hooks/useProfileStats';
import type { WeeklyStats } from '../../src/features/habits/hooks/useProfileStats';

// --------------- Day-label helper ---------------
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_LABELS[d.getDay()];
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// --------------- Weekly Chart Component ---------------
interface WeeklyChartProps {
  stats: WeeklyStats;
}

function WeeklyChart({ stats }: WeeklyChartProps) {
  const maxCount = Math.max(...Object.values(stats.completionsByDay), 1);

  return (
    <View style={styles.chartContainer}>
      {stats.days.map((day) => {
        const count = stats.completionsByDay[day] || 0;
        const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const isToday = day === stats.days[stats.days.length - 1];

        return (
          <View key={day} style={styles.chartBar}>
            <Text style={[styles.chartBarCount, { color: count > 0 ? '#3B82F6' : '#9CA3AF' }]}>
              {count}
            </Text>
            <View style={styles.chartBarTrack}>
              <View
                style={[
                  styles.chartBarFill,
                  {
                    height: `${Math.max(heightPct, count > 0 ? 8 : 4)}%` as any,
                    backgroundColor: isToday ? '#2563EB' : count > 0 ? '#3B82F6' : '#E5E7EB',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.chartBarLabel,
                isToday && { color: '#2563EB', fontWeight: '700' },
              ]}
            >
              {formatDayLabel(day)}
            </Text>
            <Text style={styles.chartBarDate}>{formatDateShort(day)}</Text>
          </View>
        );
      })}
    </View>
  );
}

// --------------- Stat Card Component ---------------
interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// --------------- Skeleton for loading ---------------
function ProfileSkeleton() {
  return (
    <SafeAreaWrapper>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header skeleton */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB', marginBottom: 12 }} />
          <View style={{ width: 160, height: 18, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 6 }} />
          <View style={{ width: 120, height: 14, backgroundColor: '#F3F4F6', borderRadius: 4 }} />
        </View>

        {/* Stats skeleton */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.statCard, { alignItems: 'center' }]}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
              <View style={{ width: 32, height: 18, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 4 }} />
              <View style={{ width: 48, height: 12, backgroundColor: '#F3F4F6', borderRadius: 4 }} />
            </View>
          ))}
        </View>

        {/* Chart skeleton */}
        <View style={{ height: 200, backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 24 }}>
          <View style={{ padding: 16 }}>
            <View style={{ width: 120, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', flex: 1 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <View key={i} style={{ alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 20, height: 100 * (i / 7), backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 4 }} />
                  <View style={{ width: 24, height: 10, backgroundColor: '#F3F4F6', borderRadius: 3 }} />
                  <View style={{ width: 20, height: 8, backgroundColor: '#F9FAFB', borderRadius: 3 }} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

// --------------- Main Profile Screen ---------------
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { habits } = useHabits();
  const { weeklyStats, loading: statsLoading, refetch } = useProfileStats();

  // Re-fetch stats every time the Profile tab gains focus,
  // since habit toggles on the Home tab change the data.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ],
    );
  };

  if (statsLoading || !weeklyStats) {
    return <ProfileSkeleton />;
  }

  const activeHabits = habits.filter((h) => (h as any).is_active !== false).length;
  const todayCompletions = weeklyStats.completionsByDay[weeklyStats.days[weeklyStats.days.length - 1]] || 0;
  const todayCompletionRate = activeHabits > 0
    ? Math.round((todayCompletions / activeHabits) * 100)
    : 0;

  return (
    <SafeAreaWrapper>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          {/* ---------- Profile Header ---------- */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#6B7280" />
            </View>
            <Text style={styles.userEmail}>{user?.email || 'User'}</Text>
            {user?.emailConfirmed && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* ---------- Quick Stats ---------- */}
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsRow}>
            <StatCard
              label="Total Done"
              value={weeklyStats.totalCompletions}
              icon="checkmark-done"
              color="#3B82F6"
            />
            <StatCard
              label="Today"
              value={`${todayCompletionRate}%`}
              icon="analytics"
              color="#8B5CF6"
            />
            <StatCard
              label="Streak"
              value={`${weeklyStats.currentStreak}d`}
              icon="flame"
              color="#EF4444"
            />
            <StatCard
              label="Active"
              value={activeHabits}
              icon="layers"
              color="#10B981"
            />
          </View>

          {/* ---------- Weekly Chart ---------- */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Daily Breakdown</Text>
              <Text style={styles.chartSubtitle}>
                {todayCompletions} completed today
              </Text>
            </View>
            <WeeklyChart stats={weeklyStats} />
          </View>

          {/* ---------- Best Day Highlight ---------- */}
          {weeklyStats.bestDay && weeklyStats.bestDay.count > 0 && (
            <View style={styles.highlightCard}>
              <Ionicons name="trophy" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightLabel}>Best Day</Text>
                <Text style={styles.highlightValue}>
                  {weeklyStats.bestDay.count} habits —{' '}
                  {new Date(weeklyStats.bestDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* ---------- Habits Summary ---------- */}
          <Text style={styles.sectionTitle}>Habits Overview</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.summaryLabel}>Total habits</Text>
              <Text style={styles.summaryValue}>{habits.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.summaryLabel}>Active</Text>
              <Text style={styles.summaryValue}>{activeHabits}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.summaryLabel}>Paused / Inactive</Text>
              <Text style={styles.summaryValue}>{habits.length - activeHabits}</Text>
            </View>
          </View>

          {/* ---------- Sign Out ---------- */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Bottom spacing */}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

// --------------- Styles ---------------
const styles = StyleSheet.create({
  // Header
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },

  // Section titles
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Stat cards row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },

  // Chart
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarCount: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartBarTrack: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBarFill: {
    width: 24,
    borderRadius: 5,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  chartBarDate: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 2,
  },

  // Highlight
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  highlightLabel: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: 14,
    color: '#78350F',
    fontWeight: '600',
  },

  // Summary card
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
