/**
 * Explore Profile Page - Visual mockup matching Figma design (node-id=393-1143)
 * Minimal styling with placeholder data for client presentation
 */

import { Theme } from '@/constants';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Image,
  Text as RNText,
} from 'react-native';
import { ThemedText } from '@/components';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  header: {
    backgroundColor: Theme.colors.neutral[300],
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Theme.colors.neutral.black,
  },
  scrollContent: {
    paddingTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primary[300],
    marginBottom: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: Theme.colors.neutral.white,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.colors.neutral.black,
    marginBottom: Theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    ...Theme.shadow.md,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.neutral.black,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Theme.colors.primary[500],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.colors.neutral.black,
  },
  historyLink: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.secondary[500],
  },
  packageCard: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    ...Theme.shadow.md,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '300',
    color: Theme.colors.neutral.black,
    marginBottom: Theme.spacing.md,
  },
  packageDetail: {
    fontSize: 14,
    fontWeight: '300',
    color: Theme.colors.neutral[700],
    marginBottom: Theme.spacing.xs,
    lineHeight: 18,
  },
  pauseButton: {
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.secondary[500],
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral.white,
  },
  chartPlaceholder: {
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
    marginBottom: Theme.spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: Theme.colors.neutral[500],
  },
  personalStatsSection: {
    marginBottom: Theme.spacing.lg,
  },
});

export default function ExploreProfile() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RNText style={styles.headerTitle}>Profile</RNText>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <RNText style={styles.avatarText}>AK</RNText>
          </View>
          <RNText style={styles.profileName}>Ayaan Kapoor</RNText>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <RNText style={styles.statLabel}>Average climbing level</RNText>
              <RNText style={styles.statValue}>L6</RNText>
            </View>
            <View style={styles.statCard}>
              <RNText style={styles.statLabel}>Strongest climbing style</RNText>
              <RNText style={styles.statValue}>Slab</RNText>
            </View>
          </View>
        </View>

        {/* Current Package Section */}
        <View style={styles.personalStatsSection}>
          <View style={styles.sectionHeader}>
            <RNText style={styles.sectionTitle}>Current Package</RNText>
            <RNText style={styles.historyLink}>History</RNText>
          </View>

          <View style={styles.packageCard}>
            <RNText style={styles.packageTitle}>1 Month Membership</RNText>
            <RNText style={styles.packageDetail}>Sessions: Unlimited</RNText>
            <RNText style={styles.packageDetail}>Start Date: January 6th, 2026</RNText>
            <RNText style={styles.packageDetail}>End Date: February 6th, 2026</RNText>
            <RNText style={styles.packageDetail}>Amount Paid: Rs. 5,000</RNText>
            <View style={styles.pauseButton}>
              <RNText style={styles.pauseButtonText}>Pause Membership</RNText>
            </View>
          </View>
        </View>

        {/* Personal Stats Section */}
        <View style={styles.personalStatsSection}>
          <View style={styles.sectionHeader}>
            <RNText style={styles.sectionTitle}>Personal Stats</RNText>
          </View>

          {/* Grade Progression Chart */}
          <RNText style={styles.chartTitle}>Grade progression over time</RNText>
          <View style={styles.chartPlaceholder}>
            <RNText style={styles.chartPlaceholderText}>[Line Chart: Grade vs Time]</RNText>
          </View>

          {/* Flashes by Grade Chart */}
          <RNText style={styles.chartTitle}>Flashes by grade</RNText>
          <View style={styles.chartPlaceholder}>
            <RNText style={styles.chartPlaceholderText}>[Bar Chart: Flashes per Grade]</RNText>
          </View>

          {/* Climbing Style Distribution Chart */}
          <RNText style={styles.chartTitle}>Climbing style distribution</RNText>
          <View style={styles.chartPlaceholder}>
            <RNText style={styles.chartPlaceholderText}>[Pie Chart: Style Distribution]</RNText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
