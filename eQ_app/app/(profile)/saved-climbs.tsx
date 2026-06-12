/**
 * Saved Climbs Screen - Shows the user's list of saved climbing problems
 */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText, Button, RouteListItem } from '@/components';
import { CaretDownIcon } from '@/components/icons';
import { Theme } from '@/constants';
import { getUserProfile, unsaveClimb, type SavedClimb } from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import logger from '@/services/logger';

export default function SavedClimbsScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [savedClimbs, setSavedClimbs] = useState<SavedClimb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved climbs
  const loadSavedClimbs = async (isMounted: { current: boolean }) => {
    if (!isAuthenticated) {
      if (isMounted.current) {
        setSavedClimbs([]);
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
        setSavedClimbs(profileResponse.saved_climbs || []);
      }
    } catch (error) {
      logger.error('Failed to load saved climbs:', error);
      if (isMounted.current) {
        setErrorMessage(getErrorMessage(error));
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
      void loadSavedClimbs(mounted);

      return () => {
        mounted.current = false;
      };
    }, [isAuthenticated])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const mounted = { current: true };
    await loadSavedClimbs(mounted);
    setIsRefreshing(false);
  };

  const handleClimbPress = (climbId: number) => {
    router.push({
      pathname: '/(profile)/route-detail',
      params: { routeId: climbId },
    });
  };

  const handleUnsave = async (climbId: number) => {
    try {
      await unsaveClimb(climbId);
      setSavedClimbs((prev) => prev.filter((c) => c.id !== climbId));
    } catch (err: any) {
      logger.error('Failed to unsave climb:', err);
      setErrorMessage(getErrorMessage(err));
    }
  };

  // Show login button if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please log in to view saved climbs</Text>
        <Button text="Go to Login" onPress={() => router.push('/login')} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      <SafeAreaView style={styles.container}>

        {/* Top bar — matches Profile screen header */}
        <View style={styles.topBar}>
          <View style={styles.topBarSide} />
          <ThemedText variant="heading1" style={styles.topBarTitle}>
            Profile
          </ThemedText>
          <View style={styles.topBarSide} />
        </View>

        {/* Back button row */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          {/* CaretDown rotated 90° to point left */}
          <View style={styles.backCaret}>
            <CaretDownIcon size={16} color={Theme.colors.primary[500]} />
          </View>
          <ThemedText variant="button" style={styles.backLabel}>
            Back
          </ThemedText>
        </TouchableOpacity>

        {/* Section heading */}
        <View style={styles.sectionHeadingRow}>
          <ThemedText variant="heading2" style={styles.sectionHeading}>
            Saved Climbs
          </ThemedText>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary[500]}
              colors={[Theme.colors.primary[500]]}
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
              <Text style={styles.loadingText}>Loading saved climbs...</Text>
            </View>
          ) : savedClimbs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Saved Climbs Yet</Text>
              <Text style={styles.emptySubtext}>
                Save your favourite climbing problems to revisit them later!
              </Text>
            </View>
          ) : (
            <View style={styles.climbsList}>
              {savedClimbs.map((climb) => (
                <RouteListItem
                  key={climb.id}
                  colour={climb.color}
                  level={climb.setter_grade}
                  difficulty={
                    climb.difficulty
                      ? climb.difficulty.charAt(0).toUpperCase() + climb.difficulty.slice(1)
                      : 'Medium'
                  }
                  climbingStyle={
                    climb.climbing_style
                      ? climb.climbing_style.charAt(0).toUpperCase() + climb.climbing_style.slice(1)
                      : 'Technical'
                  }
                  zone={`${climb.gym_name} - ${climb.wall_name}`}
                  showZone={true}
                  numberOfSends={climb.num_ascents}
                  isSent={false}
                  isSaved={true}
                  onPress={() => handleClimbPress(climb.id)}
                  onAscentPress={() => handleClimbPress(climb.id)}
                  onSavePress={() => handleUnsave(climb.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create<{
  outerContainer: ViewStyle;
  container: ViewStyle;
  authContainer: ViewStyle;
  authText: TextStyle;
  topBar: ViewStyle;
  topBarSide: ViewStyle;
  topBarTitle: TextStyle;
  backButton: ViewStyle;
  backCaret: ViewStyle;
  backLabel: TextStyle;
  sectionHeadingRow: ViewStyle;
  sectionHeading: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  scrollView: ViewStyle;
  contentContainer: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  emptyContainer: ViewStyle;
  emptyTitle: TextStyle;
  emptySubtext: TextStyle;
  climbsList: ViewStyle;
}>({
  outerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  /* Top bar — same style as profile screen header */
  topBar: {
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  topBarSide: {
    width: Theme.iconSize.lg,
  },
  topBarTitle: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
  /* Back button */
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  },
  backCaret: {
    transform: [{ rotate: '90deg' }],
  },
  backLabel: {
    color: Theme.colors.primary[500],
  },
  /* Section heading */
  sectionHeadingRow: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  sectionHeading: {
    color: Theme.semantic.text.primary,
  },
  errorContainer: {
    backgroundColor: Theme.colors.error[100],
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.error[500],
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  errorText: {
    color: Theme.colors.error[700],
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Theme.colors.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Theme.colors.neutral[600],
    textAlign: 'center',
  },
  climbsList: {
    flex: 1,
  },
});
