import { BarGraph, Button, PieChart, ProfileNavButton, StatsCard, ThemedText } from '@/components';
import { Theme } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { HistoryIcon, HoldIcon, InfoIcon, SaveIcon } from '@/components/icons';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import { getUserProfile, type UserProfile } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

const getDisplayName = (profile: UserProfile | null, fallbackUsername: string | null) => {
  const firstName = profile?.first_name?.trim() ?? '';
  const lastName = profile?.last_name?.trim() ?? '';

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  if (!fallbackUsername) {
    return 'Unknown User';
  }

  return fallbackUsername
    .trim()
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getInitials = (value: string) => {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'U';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
};

const climbingStyleColorMap: Record<string, string> = {
  Slab: Theme.colors.primary[500],
  Technical: Theme.colors.warning[500],
  Electric: Theme.colors.error[300],
  Power: Theme.colors.success[700],
  Coordination: Theme.colors.secondary[500],
};

const highestGradeColorMap: Record<string, string> = {
  L1: Theme.colors.neutral.white,
  L2: Theme.colors.warning[300],
  L3: Theme.colors.warning[500],
  L4: Theme.colors.error[500],
  L5: Theme.colors.success[500],
  L6: Theme.colors.secondary[300],
  L7: Theme.colors.secondary[500],
};

function GradeCircleIcon({ grade }: { grade: string | null }) {
  const backgroundColor = highestGradeColorMap[grade ?? ''] ?? Theme.colors.neutral[300];

  return <View style={[styles.gradeCircleIcon, { backgroundColor }]} />;
}

export default function ProfileScreen() {
  const { isAuthenticated, isLoading: authLoading, username, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = async (isMounted: { current: boolean }) => {
    if (!isAuthenticated) {
      if (isMounted.current) {
        setProfile(null);
        setErrorMessage(null);
        setIsLoading(false);
      }
      return;
    }

    try {
      if (isMounted.current) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      const profileResponse = await getUserProfile();

      if (isMounted.current) {
        setProfile(profileResponse);
      }
    } catch {
      if (isMounted.current) {
        setErrorMessage('Unable to load profile stats right now.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const mounted = { current: true };

    const runLoad = async () => {
      await loadProfile(mounted);
    };

    void runLoad();

    return () => {
      mounted.current = false;
    };
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const mounted = { current: true };
    await loadProfile(mounted);
    setIsRefreshing(false);
  };

  const displayName = getDisplayName(profile, username);
  const initials = getInitials(displayName);
  const handle = `@${profile?.username ?? username ?? 'unknown'}`;
  const totalAscents = profile?.stats.total_ascents ?? 0;
  const highestGrade = profile?.stats.highest_grade ?? '--';
  const strongestStyle = profile?.stats.strongest_climbing_style ?? 'N/A';
  const climbsByLevel = profile?.stats.climbs_by_level ?? {};
  const flashesByLevel = profile?.stats.flashes_by_level ?? {};
  const climbingStyleDistribution = profile?.stats.climbing_style_distribution ?? {};
  const climbingStyleSegments = Object.entries(climbingStyleDistribution)
    .filter(([, value]) => value > 0)
    .map(([label, value], index) => ({
      label,
      value,
      color:
        climbingStyleColorMap[label] ??
        [
          Theme.colors.primary[500],
          Theme.colors.warning[500],
          Theme.colors.error[300],
          Theme.colors.success[700],
          Theme.colors.secondary[500],
        ][index % 5],
    }));
  const strongestStyleColor = climbingStyleColorMap[strongestStyle] ?? Theme.colors.secondary[500];

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral.white} />
        <SafeAreaView style={styles.authContainer}>
          <ThemedText variant="body1" style={styles.authText}>
            Please log in to view your profile
          </ThemedText>
          <Button
            text="Go to Login"
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.button}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <ThemedText variant="heading1" style={styles.headerTitle}>
            Profile
          </ThemedText>
          <View style={styles.headerSide}>
            <TouchableOpacity
              onPress={() => router.push('/(profile)/settings')}
              accessibilityLabel="Open Settings"
              accessibilityRole="button"
            >
              <SettingsIcon size={24} color={Theme.colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => { void handleRefresh(); }}
              tintColor={Theme.colors.primary[500]}
            />
          }
        >
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <ThemedText variant="heading2" style={styles.avatarText}>
                {initials}
              </ThemedText>
            </View>
            <ThemedText variant="heading2" style={styles.name}>
              {displayName}
            </ThemedText>
            <ThemedText variant="subtext1" style={styles.username}>
              {handle}
            </ThemedText>
          </View>

          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
            </View>
          ) : null}

          {!isLoading && errorMessage ? (
            <View style={styles.stateContainer}>
              <ThemedText variant="body1" style={styles.errorText}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.navRow}>
            <ProfileNavButton
              text="Session history"
              icon={<HistoryIcon color={Theme.colors.primary[500]} />}
              onPress={() => router.push('/(profile)/session-history')}
              style={styles.navButton}
            />
            <ProfileNavButton
              text="Saved climbs"
              icon={<SaveIcon />}
              onPress={() => router.push('/(profile)/saved-climbs')}
              style={styles.navButton}
            />
            <ProfileNavButton
              text="Personal info"
              icon={<InfoIcon color={Theme.colors.primary[500]} />}
              onPress={() => router.push('/(profile)/personal-info')}
              style={styles.navButton}
            />
          </View>

          <View style={styles.statsRow}>
            <StatsCard heading="Total Climbs" value={String(totalAscents)} style={styles.statCard} />
            <StatsCard
              heading="Highest grade"
              value={highestGrade}
              icon={<GradeCircleIcon grade={profile?.stats.highest_grade ?? null} />}
              style={styles.statCard}
            />
          </View>

          <StatsCard
            heading="Strongest climbing style"
            value={strongestStyle}
            icon={<HoldIcon size={24} color={strongestStyleColor} />}
            size="wide"
            style={styles.strongestCard}
          />

          <View style={styles.personalStatsSection}>
            <ThemedText variant="heading2" style={styles.personalStatsHeading}>
              Personal Stats
            </ThemedText>

            <BarGraph
              valuesByLevel={climbsByLevel}
              heading="Number of Climbs by Level"
              color={Theme.colors.success[300]}
              style={styles.graphCard}
            />

            <BarGraph
              valuesByLevel={flashesByLevel}
              heading="Number of Flashes by Level"
              color={Theme.colors.warning[500]}
              style={styles.graphCard}
            />

            <PieChart
              heading="Climbing style distribution"
              segments={climbingStyleSegments}
              style={styles.graphCard}
            />
          </View>

          <Button
            text={isSigningOut ? 'Logging out...' : 'Log out'}
            onPress={() => {
              void handleSignOut();
            }}
            variant="secondary"
            fullWidth
            disabled={isSigningOut}
            style={styles.logoutButton}
          />
        </ScrollView>
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
  header: {
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  headerSide: {
    width: Theme.iconSize.lg,
  },
  headerTitle: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  content: {
    backgroundColor: Theme.colors.neutral.white,
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary[100],
    borderRadius: Theme.borderRadius.full,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  avatarText: {
    color: Theme.colors.primary[500],
  },
  name: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
  username: {
    color: Theme.semantic.text.secondary,
    textAlign: 'center',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  errorText: {
    color: Theme.colors.error[500],
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  navButton: {
    alignSelf: 'stretch',
    flex: 1,
    minWidth: 0,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.md - 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    width: 'auto',
  },
  strongestCard: {
    width: '100%',
  },
  personalStatsSection: {
    gap: Theme.spacing.md,
    width: '100%',
  },
  personalStatsHeading: {
    color: Theme.semantic.text.primary,
  },
  graphCard: {
    width: '100%',
  },
  gradeCircleIcon: {
    borderColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    height: 24,
    width: 24,
  },
  logoutButton: {
    marginTop: Theme.spacing.sm,
  },
  authContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  authText: {
    color: Theme.semantic.text.secondary,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});
