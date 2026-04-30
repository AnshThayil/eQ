/**
 * Explore Screen - View plans, events, and quick navigation
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=375-1050
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Theme } from '@/constants';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Pressable, ImageSourcePropType, Dimensions, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, ThemedText, InfoCardCarousel, NavSquare } from '@/components';
import { useRouter } from 'expo-router';
import { InfoCardProps } from '@/components/features/InfoCard';
import { EventsIcon, CardIcon, FacilitiesLadderIcon, ShopIcon } from '@/components/icons';
import { getExploreActive } from '@/services/api';

// Example images - replace with actual images when available
const planImage: ImageSourcePropType = require('@/assets/images/info-card-example.png');
const eventImage: ImageSourcePropType = require('@/assets/images/info-card-example.png');

// Calculate NavSquare size for 2x2 grid
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NAV_SQUARE_GAP = 17;
const NAV_SQUARE_SIZE = (SCREEN_WIDTH - (Theme.spacing.lg * 2) - NAV_SQUARE_GAP) / 2;

export default function ExploreScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [planItems, setPlanItems] = useState<InfoCardProps[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivePlans = useCallback(async () => {
    setPlansError(null);

    try {
      const response = await getExploreActive();

      const nextPlanItems = response.active_plans.map((plan) => {
        const details = [];

        if (plan.purchase_date) {
          details.push({ label: 'Purchased:', value: plan.purchase_date });
        }
        if (plan.expiry_date) {
          details.push({ label: 'Expires:', value: plan.expiry_date });
        }
        if (plan.sessions_completed !== null || plan.total_num_sessions !== null) {
          const completed = plan.sessions_completed ?? '-';
          const total = plan.total_num_sessions ?? '-';
          details.push({ label: 'Sessions:', value: `${completed}/${total}` });
        }

        return {
          title: `${plan.service_group_name} (${plan.name})`,
          pillLabel: 'Active',
          details,
          linkText: 'View Details',
          onLinkPress: () => {
            if (plan.service_type === 'membership') {
              router.push('/explore-memberships');
              return;
            }
            if (plan.service_type === 'class') {
              router.push('/explore-classes');
              return;
            }
            router.push('/explore');
          },
          image: planImage,
        };
      });

      setPlanItems(nextPlanItems);
    } catch (error) {
      console.error('Failed to load active plans:', error);
      setPlansError('Unable to load active plans right now.');
      setPlanItems([]);
    }
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivePlans();
    setRefreshing(false);
  }, [loadActivePlans]);

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }
    loadActivePlans();
  }, [isAuthenticated, isLoading, loadActivePlans]);

  if (!isLoading && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral.white} />
        <View style={styles.authContainer}>
          <ThemedText variant="body1" style={styles.authText}>
            Please log in to explore
          </ThemedText>
          <Button 
            text="Go to Login" 
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }
  // Sample data for "Upcoming Events" carousel
  const eventItems: InfoCardProps[] = [
    {
      title: 'Equinox',
      details: [
        { label: 'Date:', value: 'Feb 16, 2026' },
        { label: 'Location:', value: 'EQ Hoodi' },
        { label: 'Slots available:', value: '50' },
      ],
      linkText: 'Book Now',
      onLinkPress: () => {
        console.log('Book Now pressed for Equinox');
      },
      image: eventImage,
    },
    {
      title: 'Summer Bouldering',
      details: [
        { label: 'Date:', value: 'Feb 23, 2026' },
        { label: 'Location:', value: 'EQ Koramangala' },
        { label: 'Slots available:', value: '30' },
      ],
      linkText: 'Book Now',
      onLinkPress: () => {
        console.log('Book Now pressed for Summer Bouldering');
      },
      image: eventImage,
    },
    {
      title: 'Weekend Challenge',
      details: [
        { label: 'Date:', value: 'Mar 1, 2026' },
        { label: 'Location:', value: 'EQ Indiranagar' },
        { label: 'Slots available:', value: '25' },
      ],
      linkText: 'Book Now',
      onLinkPress: () => {
        console.log('Book Now pressed for Weekend Challenge');
      },
      image: eventImage,
    },
  ];

  const handleSeeAllEvents = () => {
    console.log('See All events');
    // Navigate to events page
  };

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Your Plans Section */}
        {planItems.length > 0 ? (
          <InfoCardCarousel
            title="Your plans"
            items={planItems}
          />
        ) : (
          <View style={styles.emptyPlansSection}>
            <ThemedText variant="body2" style={styles.sectionTitle}>
              Your plans
            </ThemedText>
            <ThemedText variant="body3" style={styles.emptyPlansText}>
              {plansError ?? 'No active plans found.'}
            </ThemedText>
          </View>
        )}

        {/* Upcoming Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="body2" style={styles.sectionTitle}>
              Upcoming Events
            </ThemedText>
            <Pressable onPress={handleSeeAllEvents}>
              <ThemedText variant="body2" style={styles.seeAllLink}>
                See All
              </ThemedText>
            </Pressable>
          </View>
          <InfoCardCarousel items={eventItems} />
        </View>

        {/* Navigation Squares Grid */}
        <View style={styles.navGrid}>
          <NavSquare
            text="Classes"
            Icon={EventsIcon}
            backgroundColor={Theme.colors.secondary[300]}
            onPress={() => router.push('/explore-classes')}
            size={NAV_SQUARE_SIZE}
          />
          <NavSquare
            text="Memberships"
            Icon={CardIcon}
            backgroundColor={Theme.colors.warning[300]}
            onPress={() => router.push('/explore-memberships')}
            size={NAV_SQUARE_SIZE}
          />
          <NavSquare
            text="Facilities"
            Icon={FacilitiesLadderIcon}
            backgroundColor={Theme.colors.error[300]}
            onPress={() => console.log('Facilities pressed')}
            size={NAV_SQUARE_SIZE}
          />
          <NavSquare
            text="Shop"
            Icon={ShopIcon}
            backgroundColor={Theme.colors.success[300]}
            onPress={() => console.log('Shop pressed')}
            size={NAV_SQUARE_SIZE}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral.white,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  authText: {
    color: Theme.colors.neutral[700],
    textAlign: 'center',
  },
  button: {
    marginTop: Theme.spacing.md,
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
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: Theme.spacing.lg,
    gap: 31,
  },
  eventsSection: {
    gap: 8,
  },
  emptyPlansSection: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  emptyPlansText: {
    color: Theme.semantic.text.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionTitle: {
    color: Theme.semantic.text.primary,
  },
  seeAllLink: {
    color: Theme.colors.primary[500],
    textDecorationLine: 'underline',
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    paddingHorizontal: Theme.spacing.lg,
  },
});
