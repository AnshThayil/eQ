import { Theme } from '@/constants';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, ThemedText, LeaderboardListItem, BlueLeaderboardListItem, InputField, CaretDownIcon, Tabs, ActivityItem } from '@/components';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLatestAscents, getLeaderboard, getGyms, ActivityAscent, Gym, LeaderboardEntry } from '@/services/api';

const STORAGE_KEY_GYM = '@leaderboard_selected_gym';
const STORAGE_KEY_TIMEFRAME = '@leaderboard_selected_timeframe';
const ALL_GYMS_VALUE = 'all';

export default function LeaderboardScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string>(ALL_GYMS_VALUE);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Currently Set');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [activityData, setActivityData] = useState<ActivityAscent[]>([]);
  const [yourRanking, setYourRanking] = useState<number | null>(null);
  const [yourUserId, setYourUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  
  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedGym, savedTimeframe] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_GYM),
          AsyncStorage.getItem(STORAGE_KEY_TIMEFRAME)
        ]);
        
        if (savedGym) setSelectedGymId(savedGym);
        if (savedTimeframe) setSelectedTimeframe(savedTimeframe);
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setPreferencesLoaded(true);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Fetch gyms on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchGyms();
    }
  }, [isAuthenticated, authLoading]);
  
  // Fetch leaderboard when filters change
  useEffect(() => {
    if (isAuthenticated && !authLoading && preferencesLoaded) {
      fetchLeaderboard();
    }
  }, [selectedGymId, selectedTimeframe, isAuthenticated, authLoading, preferencesLoaded]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchLatestActivity();
    }
  }, [isAuthenticated, authLoading]);
  
  // Auto-scroll to current user if they're not in top 3
  useEffect(() => {
    if (yourUserId && scrollViewRef.current && !isLoading && leaderboardData.length > 3) {
      // Find the user's index in the leaderboard
      const userIndex = leaderboardData.findIndex(entry => entry.id === yourUserId);
      
      // Only scroll if user is beyond the top 3 (index 3 or greater)
      if (userIndex >= 3) {
        const itemHeight = 56;
        const scrollIndex = userIndex - 3; // First scrollable item is at index 3
        const scrollY = scrollIndex * itemHeight;
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
        }, 300);
      }
    }
  }, [yourUserId, leaderboardData, isLoading]);
  
  const fetchGyms = async () => {
    try {
      const fetchedGyms = await getGyms();
      setGyms(fetchedGyms);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    }
  };
  
  const fetchLeaderboard = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const gymId = selectedGymId === ALL_GYMS_VALUE ? null : parseInt(selectedGymId);
      const onlyActive = selectedTimeframe === 'Currently Set';
      
      const data = await getLeaderboard({
        gym_id: gymId,
        only_active: onlyActive
      });
      
      setLeaderboardData(data.leaderboard);
      setYourRanking(data.your_ranking);
      setYourUserId(data.your_user_id);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchGyms(), fetchLeaderboard(false), fetchLatestActivity(false)]);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleGymChange = async (value: string) => {
    setSelectedGymId(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_GYM, value);
    } catch (error) {
      console.error('Failed to save gym preference:', error);
    }
  };
  
  const handleTimeframeChange = async (value: string) => {
    setSelectedTimeframe(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TIMEFRAME, value);
    } catch (error) {
      console.error('Failed to save timeframe preference:', error);
    }
  };

  const fetchLatestActivity = async (showLoading = true) => {
    if (showLoading) setIsActivityLoading(true);
    try {
      const latestAscents = await getLatestAscents();
      setActivityData(latestAscents);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      setActivityData([]);
    } finally {
      if (showLoading) setIsActivityLoading(false);
    }
  };

  const getClimberName = (ascent: ActivityAscent) => {
    const firstName = ascent.climber_details?.first_name?.trim() ?? '';
    const lastName = ascent.climber_details?.last_name?.trim() ?? '';
    return `${firstName} ${lastName}`.trim() || ascent.climber_details?.username || 'Unknown climber';
  };
  
  // Get gym options for dropdown
  const gymOptions = [
    { label: 'All Gyms', value: ALL_GYMS_VALUE },
    ...gyms.map(gym => ({ label: gym.name, value: gym.id.toString() }))
  ];
  
  const selectedGymLabel = gymOptions.find(opt => opt.value === selectedGymId)?.label || 'All Gyms';
  
  // Split leaderboard into top 3 and rest
  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  const leaderboardContent = (
    <>
      <View style={styles.sortSection}>
        <ThemedText variant="subtext2" style={styles.sortLabel}>
          Sort by:
        </ThemedText>
        <View style={styles.sortDropdowns}>
          <InputField
            type="dropdown"
            placeholder={selectedGymLabel}
            value={selectedGymLabel}
            rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral[900]} />}
            options={gymOptions.map(opt => opt.label)}
            onSelectOption={(label) => {
              const option = gymOptions.find(opt => opt.label === label);
              if (option) handleGymChange(option.value);
            }}
            style={styles.dropdown}
          />
          <InputField
            type="dropdown"
            placeholder={selectedTimeframe}
            value={selectedTimeframe}
            rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral[900]} />}
            options={['All Time', 'Currently Set']}
            onSelectOption={handleTimeframeChange}
            style={styles.dropdown}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <ThemedText variant="body1" style={styles.loadingText}>
            Loading leaderboard...
          </ThemedText>
        </View>
      ) : leaderboardData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText variant="body1" style={styles.emptyText}>
            No climbers found for this selection
          </ThemedText>
        </View>
      ) : (
        <>
          {top3.length > 0 && (
            <View style={styles.topThree}>
              {top3.map((entry) => (
                <LeaderboardListItem
                  key={entry.id}
                  position={entry.rank}
                  name={`${entry.first_name} ${entry.last_name}`.trim() || entry.username}
                  points={entry.total_points}
                  badgeColor={Theme.colors.warning[500]}
                />
              ))}
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollableSection}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Theme.colors.primary[500]}
                colors={[Theme.colors.primary[500]]}
              />
            }
          >
            {rest.length > 0 && (
              <View style={styles.restOfLeaderboard}>
                {rest.map((entry) => (
                  <BlueLeaderboardListItem
                    key={entry.id}
                    position={entry.rank}
                    name={`${entry.first_name} ${entry.last_name}`.trim() || entry.username}
                    points={entry.total_points}
                    isCurrentUser={yourUserId === entry.id}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </>
  );

  const activityContent = (
    isActivityLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
        <ThemedText variant="body1" style={styles.loadingText}>
          Loading activity...
        </ThemedText>
      </View>
    ) : activityData.length === 0 ? (
      <View style={styles.emptyContainer}>
        <ThemedText variant="body1" style={styles.emptyText}>
          No recent activity yet
        </ThemedText>
      </View>
    ) : (
      <ScrollView
        style={styles.activitySection}
        contentContainerStyle={styles.activityContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary[500]}
            colors={[Theme.colors.primary[500]]}
          />
        }
      >
        {activityData.map((activity) => (
          <ActivityItem
            key={activity.id}
            climberName={getClimberName(activity)}
            ascentType={activity.ascent_type}
            dateClimbed={activity.date_climbed}
            boulderGrade={activity.boulder_grade}
            difficulty={activity.boulder_difficulty}
            climbingStyle={activity.boulder_climbing_style}
            zone={activity.wall_name}
            personalGrade={activity.perceived_difficulty_display}
            routeColor={activity.boulder_color}
          />
        ))}
      </ScrollView>
    )
  );

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral.white} />
        <SafeAreaView style={styles.authContainer}>
          <ThemedText variant="body1" style={styles.authText}>
            Please log in to view leaderboard
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
          <ThemedText variant="heading1" style={styles.headerTitle}>
            Leaderboard
          </ThemedText>
        </View>

        <Tabs tabs={['Leaderboard', 'Activity']} style={styles.tabsContainer} tabBarStyle={styles.tabsBar}>
          {leaderboardContent}
          {activityContent}
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
  
  // Fixed Header Section
  header: {
    backgroundColor: Theme.colors.neutral[100],
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    color: Theme.semantic.text.primary,
    textAlign: 'center',
  },
  tabsContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  tabsBar: {
    paddingTop: 20,
  },
  
  sortSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: Theme.colors.neutral.white,
  },
  sortLabel: {
    color: Theme.colors.neutral[700],
  },
  sortDropdowns: {
    flexDirection: 'row',
    gap: 16,
  },
  dropdown: {
    flex: 1,
  },

  topThree: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: Theme.colors.neutral.white,
  },

  scrollableSection: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  scrollContent: {
    flexGrow: 0,
  },
  restOfLeaderboard: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  activitySection: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  activityContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  loadingText: {
    color: Theme.colors.neutral[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    color: Theme.colors.neutral[500],
    textAlign: 'center',
  },
});
