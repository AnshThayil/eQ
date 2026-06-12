import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { ThemedText } from '@/components';
import { Theme } from '@/constants';
import { getPersonalInfo, type PersonalInfo } from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import logger from '@/services/logger';
import { CaretDownIcon } from '@/components/icons';

const AVATAR_SIZE = 80;

const DEFAULT_AVATAR = 'https://cdn.yoactiv.com/gallery/proimg/noimg.png';

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={styles.fieldContainer}>
      <ThemedText variant="subtext2" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <View style={styles.fieldBox}>
        <ThemedText variant="body1" style={styles.fieldValue}>
          {value || '—'}
        </ThemedText>
      </View>
    </View>
  );
}

export default function PersonalInfoScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [info, setInfo] = useState<PersonalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInfo = async (isMounted: { current: boolean }) => {
    if (!isAuthenticated) {
      if (isMounted.current) {
        setInfo(null);
        setErrorMessage(null);
        setIsLoading(false);
      }
      return;
    }
    try {
      if (isMounted.current) {
        setErrorMessage(null);
        setIsLoading(true);
      }
      const data = await getPersonalInfo();
      if (isMounted.current) {
        setInfo(data);
      }
    } catch (err) {
      logger.error('Failed to load personal info:', err);
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
      void loadInfo(mounted);
      return () => {
        mounted.current = false;
      };
    }, [isAuthenticated])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const mounted = { current: true };
    await loadInfo(mounted);
    setIsRefreshing(false);
  };

  const avatarUri = info?.image && info.image !== DEFAULT_AVATAR ? info.image : null;

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <ThemedText variant="heading1" style={styles.headerTitle}>
          Profile
        </ThemedText>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary[500]}
            />
          }
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

          {/* Page heading */}
          <View style={styles.headingRow}>
            <ThemedText variant="heading2" style={styles.pageHeading}>
              Personal Information
            </ThemedText>
          </View>

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
          ) : (
            <View style={styles.contentContainer}>
              {/* Avatar */}
              <View style={styles.avatarSection}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <ThemedText variant="heading2" style={styles.avatarInitials}>
                      {info?.name
                        ? info.name
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((p) => p[0]?.toUpperCase() ?? '')
                            .join('')
                        : 'U'}
                    </ThemedText>
                  </View>
                )}
                <ThemedText variant="subtext2" style={styles.editPictureText}>
                  Edit Picture
                </ThemedText>
              </View>

              {/* Info fields */}
              <InfoField label="Name" value={info?.name} />
              <InfoField label="Email" value={info?.email} />
              <InfoField label="Phone number" value={info?.phone ? `+91 ${info.phone}` : info?.phone} />
              <InfoField label="DOB" value={info?.dob} />
              <InfoField label="Emergency Contact Name" value={info?.emergency_contact_name} />
              <InfoField label="Emergency Contact Number" value={info?.emergency_contact_number} />
            </View>
          )}
        </ScrollView>
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
    paddingTop: 20,
  },
  headerTitle: {
    color: Theme.colors.neutral[900],
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 20,
  },
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
  headingRow: {
    paddingHorizontal: 20,
  },
  pageHeading: {
    color: Theme.colors.neutral[900],
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  errorText: {
    color: Theme.colors.error[500],
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  avatarSection: {
    gap: 8,
    marginBottom: 4,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    backgroundColor: Theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: Theme.colors.primary[500],
  },
  editPictureText: {
    color: Theme.colors.primary[500],
  },
  fieldContainer: {
    gap: 4,
  },
  fieldLabel: {
    color: Theme.colors.neutral[700],
  },
  fieldBox: {
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Theme.colors.neutral.white,
  },
  fieldValue: {
    color: Theme.colors.neutral[700],
  },
});
