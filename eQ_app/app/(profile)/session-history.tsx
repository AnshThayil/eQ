/**
 * Session History Screen - Shows the user's climbing session history
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=454-2216
 *
 * Ascents are fetched from the API and grouped by date to form "sessions".
 */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, ThemedText, SessionHistoryItem, SessionCalendar, Button } from '@/components';
import type { SessionRouteItem, CalendarSession } from '@/components';
import { CaretDownIcon } from '@/components/icons';
import { Theme } from '@/constants';
import { getMyAscents, type ActivityAscent } from '@/services/api';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayNum = date.getDate();
  const suffix =
    dayNum === 11 || dayNum === 12 || dayNum === 13
      ? 'th'
      : dayNum % 10 === 1
      ? 'st'
      : dayNum % 10 === 2
      ? 'nd'
      : dayNum % 10 === 3
      ? 'rd'
      : 'th';
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  return `${monthName} ${dayNum}${suffix}, ${year}`;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDayOfWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return DAYS[new Date(year, month - 1, day).getDay()];
}

function toDateKey(dateClimbed: string): string {
  return dateClimbed.substring(0, 10);
}

// ---------------------------------------------------------------------------
// Group ascents → session list
// ---------------------------------------------------------------------------

interface Session {
  dateKey: string;
  date: string;
  dayOfWeek: string;
  routesClimbed: number;
  flashes: number;
  routes: SessionRouteItem[];
}

function groupAscentsIntoSessions(ascents: ActivityAscent[]): Session[] {
  const map = new Map<string, Session>();

  for (const ascent of ascents) {
    const key = toDateKey(ascent.date_climbed);

    if (!map.has(key)) {
      map.set(key, {
        dateKey: key,
        date: formatDateLabel(key),
        dayOfWeek: formatDayOfWeek(key),
        routesClimbed: 0,
        flashes: 0,
        routes: [],
      });
    }

    const session = map.get(key)!;
    session.routesClimbed += 1;
    if (ascent.ascent_type === 'flash') {
      session.flashes += 1;
    }

    session.routes.push({
      id: ascent.id,
      colour: ascent.boulder_color,
      level: ascent.boulder_grade,
      difficulty: ascent.boulder_difficulty,
      zone: ascent.wall_name,
      climbingStyle: ascent.boulder_climbing_style,
      isFlash: ascent.ascent_type === 'flash',
      isLiked: ascent.liked,
      perceivedDifficulty: ascent.perceived_difficulty_display,
    });
  }

  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SessionHistoryScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calendarSessions: CalendarSession[] = sessions.map((s) => ({
    dateKey: s.dateKey,
    routesClimbed: s.routesClimbed,
    flashes: s.flashes,
  }));

  const loadSessions = async (isMounted: { current: boolean }) => {
    if (!isAuthenticated) {
      if (isMounted.current) {
        setSessions([]);
        setIsLoading(false);
      }
      return;
    }

    try {
      if (isMounted.current) {
        setIsLoading(true);
        setErrorMessage(null);
      }
      const ascents = await getMyAscents();
      if (isMounted.current) {
        setSessions(groupAscentsIntoSessions(ascents));
      }
    } catch {
      if (isMounted.current) {
        setErrorMessage('Unable to load session history right now.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const mounted = { current: true };
      void loadSessions(mounted);
      return () => {
        mounted.current = false;
      };
    }, [isAuthenticated])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const mounted = { current: true };
    await loadSessions(mounted);
    setIsRefreshing(false);
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.outerContainer}>
        <SafeAreaView style={styles.authContainer}>
          <ThemedText variant="body1" style={styles.authText}>
            Please log in to view your session history
          </ThemedText>
          <Button
            text="Go to Login"
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.authButton}
          />
        </SafeAreaView>
      </View>
    );
  }

  const listContent = isLoading ? (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
    </View>
  ) : errorMessage ? (
    <View style={styles.stateContainer}>
      <ThemedText variant="body1" style={styles.errorText}>
        {errorMessage}
      </ThemedText>
    </View>
  ) : sessions.length === 0 ? (
    <View style={styles.stateContainer}>
      <ThemedText variant="body1" style={styles.emptyText}>
        No sessions yet. Start climbing!
      </ThemedText>
    </View>
  ) : (
    sessions.map((session) => (
      <SessionHistoryItem
        key={session.dateKey}
        date={session.date}
        dayOfWeek={session.dayOfWeek}
        routesClimbed={session.routesClimbed}
        flashes={session.flashes}
        routes={session.routes}
      />
    ))
  );

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      <SafeAreaView style={styles.container}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarSide} />
          <ThemedText variant="heading1" style={styles.topBarTitle}>
            Profile
          </ThemedText>
          <View style={styles.topBarSide} />
        </View>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <View style={styles.backCaret}>
            <CaretDownIcon size={16} color={Theme.colors.primary[500]} />
          </View>
          <ThemedText variant="button" style={styles.backLabel}>
            Back
          </ThemedText>
        </TouchableOpacity>

        {/* Section heading — its own row, not inline with tabs */}
        <View style={styles.sectionHeadingRow}>
          <ThemedText variant="heading2" style={styles.sectionHeading}>
            Session History
          </ThemedText>
        </View>

        {/* Tabs: List | Calendar — sits below the heading */}
        <Tabs tabs={['List', 'Calendar']} style={styles.tabs}>

          {/* List tab */}
          <ScrollView
            style={styles.tabScrollView}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => { void handleRefresh(); }}
                tintColor={Theme.colors.primary[500]}
              />
            }
          >
            {listContent}
          </ScrollView>

          {/* Calendar tab */}
          <ScrollView
            style={styles.tabScrollView}
            contentContainerStyle={styles.calendarContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
              </View>
            ) : (
              <SessionCalendar sessions={calendarSessions} />
            )}
          </ScrollView>

        </Tabs>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  topBarSide: {
    width: 24,
  },
  topBarTitle: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  backCaret: {
    transform: [{ rotate: '90deg' }],
  },
  backLabel: {
    color: Theme.colors.primary[500],
  },
  sectionHeadingRow: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  sectionHeading: {
    color: Theme.semantic.text.primary,
  },
  tabs: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  tabScrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  listContent: {
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  calendarContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  errorText: {
    color: Theme.colors.error[500],
    textAlign: 'center',
  },
  emptyText: {
    color: Theme.semantic.text.secondary,
    textAlign: 'center',
  },
  authContainer: {
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.md,
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  authText: {
    color: Theme.semantic.text.secondary,
    textAlign: 'center',
  },
  authButton: {
    width: '100%',
  },
});
