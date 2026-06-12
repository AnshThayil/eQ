import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components';
import { Theme } from '@/constants';
import { ActionPill } from '@/components/basic/ActionPill';
import { CaretDownIcon } from '@/components/icons';
import { getUserSettings, updateUserSettings, type UserSettings } from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import logger from '@/services/logger';

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText variant="body2" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedText variant="subtext1" style={styles.sectionSubtitle}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSettings = async (isMounted: { current: boolean }) => {
    if (!isAuthenticated) {
      if (isMounted.current) {
        setSettings(null);
        setIsLoading(false);
      }
      return;
    }
    try {
      if (isMounted.current) {
        setErrorMessage(null);
        setIsLoading(true);
      }
      const data = await getUserSettings();
      if (isMounted.current) {
        setSettings(data);
      }
    } catch (err) {
      logger.error('Failed to load settings:', err);
      if (isMounted.current) {
        setErrorMessage(getErrorMessage(err));
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
      void loadSettings(mounted);
      return () => {
        mounted.current = false;
      };
    }, [isAuthenticated])
  );

  const patchSetting = async (patch: Partial<UserSettings>) => {
    if (!settings || isSaving) return;
    // Optimistic update
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    setIsSaving(true);
    try {
      const updated = await updateUserSettings(patch);
      setSettings(updated);
    } catch (err) {
      logger.error('Failed to save setting:', err);
      // Revert on failure
      setSettings((prev) => (prev ? { ...prev } : prev));
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <ThemedText variant="heading1" style={styles.headerTitle}>
          Settings
        </ThemedText>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
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

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
            </View>
          ) : errorMessage ? (
            <View style={styles.errorContainer}>
              <ThemedText variant="body1" style={styles.errorText}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : settings ? (
            <View style={styles.contentContainer}>
              {/* ── Leaderboard ──────────────────────────────────────── */}
              <View style={styles.section}>
                <SectionHeader
                  title="Leaderboard"
                  subtitle="Be a part of the gym leaderboard"
                />
                <View style={styles.pillRow}>
                  <ActionPill
                    text="Participate"
                    isSelected={settings.leaderboard_opt_in}
                    onPress={() => patchSetting({ leaderboard_opt_in: true })}
                  />
                  <ActionPill
                    text="Don't participate"
                    isSelected={!settings.leaderboard_opt_in}
                    onPress={() => patchSetting({ leaderboard_opt_in: false })}
                  />
                </View>
              </View>

              {/* ── Sends ─────────────────────────────────────────────── */}
              <View style={styles.section}>
                <SectionHeader
                  title="Sends"
                  subtitle="Who can see your sends on their feed"
                />
                <View style={styles.pillRow}>
                  <ActionPill
                    text="Everyone"
                    isSelected={settings.sends_visibility === 'everyone'}
                    onPress={() => patchSetting({ sends_visibility: 'everyone' })}
                  />
                  <ActionPill
                    text="Only me"
                    isSelected={settings.sends_visibility === 'only_me'}
                    onPress={() => patchSetting({ sends_visibility: 'only_me' })}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => Alert.alert('Reset Password', 'Password reset is not yet available in-app.')}
            accessibilityRole="button"
            accessibilityLabel="Reset Password"
          >
            <ThemedText variant="button" style={styles.footerButtonText}>
              Reset Password
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <ThemedText variant="button" style={styles.footerButtonText}>
              Logout
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  headerBar: {
    backgroundColor: Theme.colors.neutral[100],
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Theme.colors.neutral.black,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
  },
  backCaret: {
    transform: [{ rotate: '90deg' }],
  },
  backLabel: {
    color: Theme.colors.primary[500],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  errorText: {
    color: Theme.colors.error[500],
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 36,
    paddingTop: 8,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    color: Theme.colors.neutral.black,
    fontWeight: '500',
  },
  sectionSubtitle: {
    color: Theme.colors.neutral[500],
  },
  pillRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  footer: {
    backgroundColor: Theme.colors.neutral[100],
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  footerButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 4,
  },
  footerButtonText: {
    color: Theme.colors.primary[500],
  },
});
