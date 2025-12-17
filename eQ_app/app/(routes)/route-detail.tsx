/**
 * Route Detail Screen - Shows detailed information about a specific route and all ascents
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=290-2355
 */

import { AddAscentModal } from '@/components/AddAscentModal';
import { AscentsListItem } from '@/components/AscentsListItem';
import { CaretDownIcon, LocationPinIcon, MapIcon } from '@/components/icons';
import { InputField } from '@/components/InputField';
import { RouteListItem } from '@/components/RouteListItem';
import { Theme } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { Boulder, deleteAscent, getBoulder, getGyms, logAscent, Gym } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';

interface AscentDisplay {
  id: number;
  climberName: string;
  date: string;
  rating: string;
  isFlash: boolean;
  position: number;
}

export default function RouteDetailScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ routeId: string; gymId?: string }>();
  const routeId = params.routeId;
  const paramGymId = params.gymId ? parseInt(params.gymId) : null;

  const [boulder, setBoulder] = useState<Boulder | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ascents, setAscents] = useState<AscentDisplay[]>([]);

  // Load saved gym ID and fetch gyms on mount
  useEffect(() => {
    loadSavedGymId();
    loadGyms();
  }, []);

  // Load boulder details when routeId changes
  useEffect(() => {
    if (routeId) {
      loadBoulderDetails(parseInt(routeId));
    }
  }, [routeId]);

  const loadSavedGymId = async () => {
    try {
      const savedGymId = await AsyncStorage.getItem('selectedGymId');
      if (savedGymId) {
        setSelectedGymId(parseInt(savedGymId));
      } else if (paramGymId) {
        setSelectedGymId(paramGymId);
      } else {
        setSelectedGymId(3);
      }
    } catch (error) {
      console.error('Failed to load saved gym ID:', error);
      setSelectedGymId(paramGymId || 3);
    }
  };

  const loadGyms = async () => {
    try {
      const gymsData = await getGyms();
      setGyms(Array.isArray(gymsData) ? gymsData : []);
    } catch (err) {
      console.error('Failed to load gyms:', err);
      setGyms([]);
    }
  };

  const loadBoulderDetails = async (boulderId: number) => {
    try {
      setLoading(true);
      setError(null);
      const boulderData = await getBoulder(boulderId);
      setBoulder(boulderData);
      
      // Transform ascents data
      if (boulderData.ascents && Array.isArray(boulderData.ascents)) {
        const transformedAscents: AscentDisplay[] = boulderData.ascents.map((ascent, index) => {
          // Get climber name from climber_details if available
          let climberName = 'Unknown Climber';
          if (ascent.climber_details) {
            const { first_name, last_name, username } = ascent.climber_details;
            if (first_name && last_name) {
              climberName = `${first_name} ${last_name}`;
            } else if (username) {
              climberName = username;
            }
          }
          
          return {
            id: ascent.id,
            climberName,
            date: new Date(ascent.date_climbed).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            }),
            rating: getDifficultyFromBoulder(boulderData.difficulty),
            isFlash: ascent.ascent_type === 'flash',
            position: index + 1,
          };
        });
        setAscents(transformedAscents);
      } else {
        setAscents([]);
      }
    } catch (err) {
      console.error('Failed to load boulder details:', err);
      setError('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyFromBoulder = (difficulty: string): string => {
    if (!difficulty) return 'Medium';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  };

  const onRefresh = async () => {
    if (routeId) {
      setRefreshing(true);
      try {
        await loadBoulderDetails(parseInt(routeId));
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleAscentToggle = () => {
    if (!boulder) return;

    if (boulder.user_has_sent) {
      // If already sent, delete the ascent
      handleDeleteAscent();
    } else {
      // If not sent, open modal to log ascent
      setModalVisible(true);
    }
  };

  const handleDeleteAscent = async () => {
    if (!boulder) return;

    try {
      const response = await deleteAscent(boulder.id);
      setBoulder(response.boulder);
      // Reload to get updated ascents list
      await loadBoulderDetails(boulder.id);
    } catch (err: any) {
      console.error('Failed to delete ascent:', err);
      if (err.response?.status === 401) {
        setError('Please log in to delete ascents');
      } else {
        setError('Failed to delete ascent');
      }
    }
  };

  const handleModalSubmit = async (data: { difficulty: string; isFlash: boolean; comments: string }) => {
    if (!boulder) return;

    const ascentType = data.isFlash ? 'flash' : 'send';

    try {
      const response = await logAscent(boulder.id, ascentType);
      setModalVisible(false);
      setBoulder(response.boulder);
      // Reload to get updated ascents list
      await loadBoulderDetails(boulder.id);
    } catch (err: any) {
      console.error('Failed to log ascent:', err);
      if (err.response?.status === 401) {
        setError('Please log in to log ascents');
        setModalVisible(false);
      } else {
        setError('Failed to log ascent');
      }
    }
  };

  const handleGymChange = async (gymName: string) => {
    if (!Array.isArray(gyms)) return;
    const selectedGym = gyms.find((g) => g.name === gymName);
    if (selectedGym) {
      setSelectedGymId(selectedGym.id);
      try {
        await AsyncStorage.setItem('selectedGymId', selectedGym.id.toString());
      } catch (error) {
        console.error('Failed to save gym ID:', error);
      }
    }
  };

  const getSelectedGymName = (): string => {
    if (!Array.isArray(gyms)) return 'Loading...';
    const gym = gyms.find((g) => g.id === selectedGymId);
    return gym?.name || 'Select Gym';
  };

  const getGymOptions = (): string[] => {
    if (!Array.isArray(gyms)) return [];
    return gyms.map((g) => g.name);
  };

  const getWallName = (): string => {
    if (boulder?.wall_details?.name) {
      return boulder.wall_details.name;
    }
    // Fallback to wall ID if name not available
    return `Wall ${boulder?.wall || 1}`;
  };

  // Show login button if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please log in to view route details</Text>
        <Button text="Go to Login" onPress={() => router.push('/login')} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      <SafeAreaView style={styles.container}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Header */}
          <View style={styles.header}>
            <InputField
              type="dropdown"
              placeholder={getSelectedGymName()}
              value={getSelectedGymName()}
              leftIcon={<LocationPinIcon size={24} color={Theme.colors.secondary[500]} />}
              rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral.black} />}
              options={getGymOptions()}
              onSelectOption={handleGymChange}
              style={styles.locationInput}
            />
            <TouchableOpacity
              style={styles.mapButton}
              accessibilityLabel="View map"
              accessibilityHint="Opens map view of routes"
            >
              <MapIcon size={40} color={Theme.colors.secondary[500]} />
            </TouchableOpacity>
          </View>

          {/* Route Summary */}
          {boulder && (
            <View style={styles.routeSummary}>
              <RouteListItem
                colour={boulder.color}
                level={boulder.setter_grade}
                difficulty={getDifficultyFromBoulder(boulder.difficulty)}
                climbingStyle={
                  boulder.climbing_style
                    ? boulder.climbing_style.charAt(0).toUpperCase() + boulder.climbing_style.slice(1)
                    : 'Technical'
                }
                zone={getWallName()}
                showZone={true}
                numberOfSends={boulder.num_ascents}
                isSent={boulder.user_has_sent}
                isSaved={false}
                onAscentPress={handleAscentToggle}
                onSavePress={() => {
                  /* TODO: Implement save functionality */
                }}
                style={styles.routeListItemOverride}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
              <Text style={styles.loadingText}>Loading route details...</Text>
            </View>
          ) : (
            <>
              {/* Sends Header */}
              <View style={styles.sendsHeader}>
                <ThemedText variant="heading2" style={styles.sendsTitle}>
                  Sends ({ascents.length})
                </ThemedText>
              </View>

              {/* Ascents List */}
              <View style={styles.ascentsList}>
                {ascents.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No sends yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to send this route!</Text>
                  </View>
                ) : (
                  ascents.map((ascent, index) => (
                    <AscentsListItem
                      key={ascent.id}
                      name={ascent.climberName}
                      date={ascent.date}
                      rating={ascent.rating}
                      flash={ascent.isFlash}
                      position={ascent.position}
                      style={index < ascents.length - 1 ? styles.ascentListItemWithMargin : undefined}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Add Ascent Modal */}
        {boulder && (
          <AddAscentModal
            visible={modalVisible}
            level={boulder.setter_grade}
            colour={boulder.color}
            onCancel={() => setModalVisible(false)}
            onSubmit={handleModalSubmit}
            difficultyOptions={['Easy', 'Medium', 'Hard']}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create<{
  outerContainer: ViewStyle;
  container: ViewStyle;
  authContainer: ViewStyle;
  authText: TextStyle;
  headerSection: ViewStyle;
  header: ViewStyle;
  locationInput: ViewStyle;
  mapButton: ViewStyle;
  routeSummary: ViewStyle;
  routeListItemOverride: ViewStyle;
  scrollView: ViewStyle;
  contentContainer: ViewStyle;
  sendsHeader: ViewStyle;
  sendsTitle: TextStyle;
  ascentsList: ViewStyle;
  ascentListItemWithMargin: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  emptySubtext: TextStyle;
}>({
  outerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
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
    fontSize: 18,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
    textAlign: 'center',
  },
  headerSection: {
    backgroundColor: Theme.colors.neutral[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[100],
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  locationInput: {
    flex: 1,
    width: undefined,
  },
  mapButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeSummary: {
    backgroundColor: Theme.colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.semantic.border.default,
  },
  routeListItemOverride: {
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  contentContainer: {
    gap: 0,
    paddingBottom: 24,
    backgroundColor: Theme.colors.neutral.white,
  },
  sendsHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendsTitle: {
    color: Theme.semantic.text.primary,
  },
  ascentsList: {
    gap: 0,
    paddingTop: 24,
  },
  ascentListItemWithMargin: {
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Theme.colors.neutral[500],
  },
  errorContainer: {
    backgroundColor: Theme.colors.error[500],
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Theme.colors.neutral[500],
    textAlign: 'center',
  },
});
