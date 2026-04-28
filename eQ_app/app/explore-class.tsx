/**
 * Explore Class Page - Shows class details matching Figma design
 * Node ID: 389-1291
 */

import { Theme } from '@/constants';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Pressable, Image, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  backText: {
    color: Theme.colors.primary[500],
    marginLeft: Theme.spacing.sm,
    fontSize: 14,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  classInfo: {
    flex: 1,
  },
  classTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.colors.neutral.black,
    marginBottom: Theme.spacing.sm,
  },
  statusPill: {
    backgroundColor: Theme.colors.neutral[300],
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '300',
    color: Theme.colors.neutral.black,
  },
  classDetails: {
    marginBottom: Theme.spacing.lg,
  },
  detailRow: {
    marginBottom: Theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '300',
    color: Theme.colors.neutral.black,
    lineHeight: 18,
  },
  classImage: {
    width: '100%',
    height: 220,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.neutral[300],
  },
  sessionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.neutral.black,
    marginBottom: Theme.spacing.md,
  },
  sessionInfo: {
    marginBottom: Theme.spacing.sm,
  },
  sessionInfoText: {
    fontSize: 16,
    fontWeight: '300',
    color: Theme.colors.neutral.black,
    lineHeight: 24,
  },
  editIcon: {
    width: 24,
    height: 24,
    tintColor: Theme.colors.primary[500],
  },
  resumeButton: {
    backgroundColor: Theme.colors.primary[500],
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
  },
  resumeButtonText: {
    color: Theme.colors.neutral.white,
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    backgroundColor: Theme.colors.neutral[100],
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerText: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
});

export default function ExploreClassScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      
      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="heading1" style={styles.headerText}>
          Explore
        </ThemedText>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </Pressable>

        {/* Class Header with Resume Button */}
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <ThemedText style={styles.classTitle}>Climbfit</ThemedText>
            <View style={styles.statusPill}>
              <ThemedText style={styles.statusText}>Paused</ThemedText>
            </View>
          </View>
          <Pressable style={styles.resumeButton}>
            <ThemedText style={styles.resumeButtonText}>Resume</ThemedText>
          </Pressable>
        </View>

        {/* Class Details */}
        <View style={styles.classDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailText}>Date of purchase: 02/01/2026</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailText}>Amount paid: Rs.1500</ThemedText>
          </View>
        </View>

        {/* Class Image */}
        <Image
          source={require('@/assets/images/info-card-example.png')}
          style={styles.classImage}
          resizeMode="cover"
        />

        {/* Session Details */}
        <View style={styles.sessionSection}>
          <View style={styles.sessionDetails}>
            <ThemedText style={styles.sessionTitle}>Session Details</ThemedText>
            <View style={styles.sessionInfo}>
              <ThemedText style={styles.sessionInfoText}>Sessions completed: 4/12</ThemedText>
            </View>
            <View style={styles.sessionInfo}>
              <ThemedText style={styles.sessionInfoText}>Day(s): Monday, Wednesday</ThemedText>
            </View>
            <View style={styles.sessionInfo}>
              <ThemedText style={styles.sessionInfoText}>Time: 6:00 PM</ThemedText>
            </View>
            <View style={styles.sessionInfo}>
              <ThemedText style={styles.sessionInfoText}>Location: EQ Hoodi</ThemedText>
            </View>
          </View>
          <Pressable>
            <Image
              source={require('@/assets/images/info-card-example.png')}
              style={styles.editIcon}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
