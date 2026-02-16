/**
 * Example usage of InfoCard component
 */

import React from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { InfoCard } from '../../features/InfoCard';
import { ThemedText } from '../../basic/ThemedText';
import { Theme } from '@/constants/Theme';

export function InfoCardExample() {
  const handleViewDetails = (title: string) => {
    Alert.alert('Button Pressed', `View details for: ${title}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <ThemedText variant="heading2" style={styles.sectionTitle}>
          InfoCard Examples
        </ThemedText>
      </View>

      {/* Example 1: Gym class card with status */}
      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.label}>
          Gym Class Card
        </ThemedText>
        <InfoCard
          title="Climbfit"
          pillLabel="Paused"
          details={[
            { label: 'Sessions:', value: '4/12' },
            { label: 'Slot:', value: '6:00 PM' },
            { label: 'Location:', value: 'EQ Hoodi' },
          ]}
          linkText="View Details"
          onLinkPress={() => handleViewDetails('Climbfit')}
          image={require('@/assets/images/info-card-example.png')}
        />
      </View>

      {/* Example 2: Event card without status */}
      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.label}>
          Event Card (No Status)
        </ThemedText>
        <InfoCard
          title="Bouldering Competition"
          details={[
            { label: 'Date:', value: 'Feb 20, 2026' },
            { label: 'Time:', value: '10:00 AM' },
            { label: 'Registration:', value: 'Open' },
          ]}
          linkText="Register Now"
          onLinkPress={() => handleViewDetails('Bouldering Competition')}
          image={require('@/assets/images/info-card-example.png')}
        />
      </View>

      {/* Example 3: Training program card */}
      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.label}>
          Training Program
        </ThemedText>
        <InfoCard
          title="Advanced Training"
          pillLabel="Active"
          details={[
            { label: 'Progress:', value: '8/16 weeks' },
            { label: 'Next:', value: 'Wednesday' },
            { label: 'Coach:', value: 'Sarah M.' },
          ]}
          linkText="View Program"
          onLinkPress={() => handleViewDetails('Advanced Training')}
          image={require('@/assets/images/info-card-example.png')}
        />
      </View>

      {/* Example 4: Membership card */}
      <View style={styles.section}>
        <ThemedText variant="body2" style={styles.label}>
          Membership Card
        </ThemedText>
        <InfoCard
          title="Premium Membership"
          pillLabel="Expiring"
          details={[
            { label: 'Valid Until:', value: 'Mar 15, 2026' },
            { label: 'Visits:', value: '45 this month' },
            { label: 'Benefits:', value: 'All Access' },
          ]}
          linkText="Renew Now"
          onLinkPress={() => handleViewDetails('Premium Membership')}
          image={require('@/assets/images/info-card-example.png')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  contentContainer: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.lg,
  },
  section: {
    gap: Theme.spacing.sm,
  },
  sectionTitle: {
    color: Theme.semantic.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  label: {
    color: Theme.semantic.text.secondary,
  },
});
