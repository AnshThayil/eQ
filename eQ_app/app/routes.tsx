/**
 * Routes Screen - Main screen for viewing climbing routes organized by zones
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=13-144
 */

import { ActionPill } from '@/components/ActionPill';
import { AddAscentModal } from '@/components/AddAscentModal';
import { FilterModal } from '@/components/FilterModal';
import { CaretDownIcon, FilterIcon, LocationPinIcon, MapIcon, SortIcon } from '@/components/icons';
import { InputField } from '@/components/InputField';
import { RouteListItem } from '@/components/RouteListItem';
import { ZoneAccordion } from '@/components/ZoneAccordion';
import { Theme } from '@/constants';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, ActivityIndicator, Text, ViewStyle, TextStyle, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getGyms, getGym, logAscent, deleteAscent, Gym, Boulder, Wall } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';

interface Route {
  id: string;
  colour: string;
  level: string;
  difficulty: string;
  climbingStyle: string;
  numberOfSends: number;
  isSent: boolean;
  isSaved: boolean;
}

interface Zone {
  id: string;
  name: string;
  dateSet: string;
  isOpen: boolean;
  routes: Route[];
}

export default function RoutesScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeView, setActiveView] = useState<'zones' | 'mostClimbed' | 'level'>('zones');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // For ascending/descending sort
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{ zoneId: string; routeId: string; route: Route | null }>({
    zoneId: '',
    routeId: '',
    route: null,
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Load saved gym ID and fetch gyms on mount
  useEffect(() => {
    loadSavedGymId();
    loadGyms();
  }, []);

  const loadSavedGymId = async () => {
    try {
      const savedGymId = await AsyncStorage.getItem('selectedGymId');
      if (savedGymId) {
        setSelectedGymId(parseInt(savedGymId));
      } else {
        // Default to gym ID 3 if no saved preference
        setSelectedGymId(3);
      }
    } catch (error) {
      console.error('Failed to load saved gym ID:', error);
      setSelectedGymId(3);
    }
  };

  const loadAccordionStates = async (gymId: number): Promise<Map<string, boolean>> => {
    try {
      const key = `accordionStates_${gymId}`;
      const savedStates = await AsyncStorage.getItem(key);
      if (savedStates) {
        const statesObj = JSON.parse(savedStates);
        return new Map(Object.entries(statesObj));
      }
    } catch (error) {
      console.error('Failed to load accordion states:', error);
    }
    return new Map();
  };

  const saveAccordionStates = async (gymId: number, states: Map<string, boolean>) => {
    try {
      const key = `accordionStates_${gymId}`;
      const statesObj = Object.fromEntries(states);
      await AsyncStorage.setItem(key, JSON.stringify(statesObj));
    } catch (error) {
      console.error('Failed to save accordion states:', error);
    }
  };

  // Fetch gym details when gym is selected
  useEffect(() => {
    if (selectedGymId) {
      loadGymDetails(selectedGymId);
    }
  }, [selectedGymId]);

  // Refresh gym details when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      if (selectedGymId) {
        loadGymDetails(selectedGymId);
      }
    }, [selectedGymId])
  );

  const loadGyms = async () => {
    try {
      setLoading(true);
      setError(null);
      const gymsData = await getGyms();
      console.log('Gyms data received:', gymsData);
      console.log('Is array?', Array.isArray(gymsData));
      // Ensure we always set an array
      setGyms(Array.isArray(gymsData) ? gymsData : []);
    } catch (err) {
      console.error('Failed to load gyms:', err);
      setError('Failed to load gyms');
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGymDetails = async (gymId: number) => {
    try {
      setLoading(true);
      setError(null);
      const gymData = await getGym(gymId);
      
      // Load saved accordion states from AsyncStorage
      const savedStates = await loadAccordionStates(gymId);
      
      // If we have current states in memory, prefer those (user just toggled)
      // Otherwise use saved states from AsyncStorage
      const currentOpenStates = new Map<string, boolean>();
      zones.forEach(zone => {
        currentOpenStates.set(zone.id, zone.isOpen);
      });
      
      // Transform API data to Zone format
      const transformedZones = transformGymDataToZones(gymData);
      
      // Check if any accordions should be open
      const hasAnyOpen = savedStates.size > 0 && Array.from(savedStates.values()).some(isOpen => isOpen);
      
      // Restore accordion states (prefer current memory, then saved, then default)
      const zonesWithStates = transformedZones.map((zone, index) => ({
        ...zone,
        isOpen: currentOpenStates.get(zone.id) ?? savedStates.get(zone.id) ?? (index === 0 && !hasAnyOpen),
      }));
      
      setZones(zonesWithStates);
    } catch (err) {
      console.error('Failed to load gym details:', err);
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const transformGymDataToZones = (gym: Gym): Zone[] => {
    if (!gym.walls || !gym.boulders) return [];

    // Group boulders by wall
    const wallsMap = new Map<number, Wall>();
    gym.walls.forEach(wall => wallsMap.set(wall.id, wall));

    const zonesMap = new Map<number, Zone>();
    
    gym.boulders.forEach((boulder: Boulder) => {
      const wall = wallsMap.get(boulder.wall);
      if (!wall) return;

      if (!zonesMap.has(boulder.wall)) {
        zonesMap.set(boulder.wall, {
          id: boulder.wall.toString(),
          name: wall.name,
          dateSet: `Set on ${new Date(boulder.date_set).toLocaleDateString('en-GB')}`,
          isOpen: false,
          routes: [],
        });
      }

      const zone = zonesMap.get(boulder.wall)!;
      zone.routes.push({
        id: boulder.id.toString(),
        colour: boulder.color,
        level: boulder.setter_grade,
        difficulty: boulder.difficulty ? capitalizeFirst(boulder.difficulty) : 'Medium',
        climbingStyle: boulder.climbing_style ? capitalizeFirst(boulder.climbing_style) : 'Technical',
        numberOfSends: boulder.num_ascents,
        isSent: boulder.user_has_sent,
        isSaved: false, // TODO: Connect to saved routes API
      });
    });

    return Array.from(zonesMap.values());
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const updateBoulderInState = (updatedBoulder: Boulder) => {
    setZones(prevZones => 
      prevZones.map(zone => ({
        ...zone,
        routes: zone.routes.map(route => 
          route.id === updatedBoulder.id.toString()
            ? {
                ...route,
                numberOfSends: updatedBoulder.num_ascents,
                isSent: updatedBoulder.user_has_sent,
              }
            : route
        ),
      }))
    );
  };

  const onRefresh = async () => {
    if (selectedGymId) {
      setRefreshing(true);
      try {
        await loadGymDetails(selectedGymId);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleAscentToggle = (zoneId: string, routeId: string) => {
    const boulderId = parseInt(routeId);
    const zone = zones.find(z => z.id === zoneId);
    const route = zone?.routes.find(r => r.id === routeId);
    
    // Check if route is already marked as sent
    const isSent = route?.isSent;

    if (isSent) {
      // If already sent, delete the ascent directly without modal
      handleDeleteAscent(zoneId, routeId);
    } else {
      // If not sent, open modal to log ascent
      setSelectedRoute({ zoneId, routeId, route: route || null });
      setModalVisible(true);
    }
  };

  const handleDeleteAscent = async (zoneId: string, routeId: string) => {
    const boulderId = parseInt(routeId);
    try {
      const response = await deleteAscent(boulderId);
      // Update only the affected boulder in state
      updateBoulderInState(response.boulder);
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
    const { zoneId, routeId } = selectedRoute;
    const boulderId = parseInt(routeId);
    const ascentType = data.isFlash ? 'flash' : 'send';

    try {
      const response = await logAscent(boulderId, ascentType);
      setModalVisible(false);
      
      // Update only the affected boulder in state
      updateBoulderInState(response.boulder);
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

  const toggleZone = async (zoneId: string) => {
    const updatedZones = zones.map((zone) =>
      zone.id === zoneId 
        ? { ...zone, isOpen: !zone.isOpen } 
        : { ...zone, isOpen: false }
    );
    
    setZones(updatedZones);
    
    // Save accordion states to AsyncStorage
    if (selectedGymId) {
      const states = new Map<string, boolean>();
      updatedZones.forEach(zone => {
        states.set(zone.id, zone.isOpen);
      });
      await saveAccordionStates(selectedGymId, states);
    }
  };

  const toggleRouteAscent = (zoneId: string, routeId: string) => {
    setZones(
      zones.map((zone) =>
        zone.id === zoneId
          ? {
              ...zone,
              routes: zone.routes.map((route) =>
                route.id === routeId
                  ? { ...route, isSent: !route.isSent }
                  : route
              ),
            }
          : zone
      )
    );
  };

  const handleFilterPress = (filter: 'zones' | 'mostClimbed' | 'level') => {
    if (activeView === filter && filter !== 'zones') {
      // Toggle sort order if clicking the same active filter
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setActiveView(filter);
      setSortOrder('desc'); // Reset to descending when changing filters
    }
  };

  const handleGymChange = async (gymName: string) => {
    if (!Array.isArray(gyms)) return;
    const selectedGym = gyms.find(g => g.name === gymName);
    if (selectedGym) {
      setSelectedGymId(selectedGym.id);
      // Save the selected gym ID to AsyncStorage
      try {
        await AsyncStorage.setItem('selectedGymId', selectedGym.id.toString());
      } catch (error) {
        console.error('Failed to save gym ID:', error);
      }
    }
  };

  const getSelectedGymName = (): string => {
    if (!Array.isArray(gyms)) return 'Loading...';
    const gym = gyms.find(g => g.id === selectedGymId);
    return gym?.name || 'Select Gym';
  };

  const getGymOptions = (): string[] => {
    if (!Array.isArray(gyms)) return [];
    return gyms.map(g => g.name);
  };

  // Get all routes from all zones in a flat list
  const getAllRoutes = (): (Route & { zoneName: string; zoneId: string })[] => {
    return zones.flatMap((zone) =>
      zone.routes.map((route) => ({
        ...route,
        zoneName: zone.name,
        zoneId: zone.id,
      }))
    );
  };

  // Filter routes based on selected grades and styles
  const getFilteredRoutes = (routes: (Route & { zoneName: string; zoneId: string })[]): (Route & { zoneName: string; zoneId: string })[] => {
    let filtered = routes;

    // Filter by grades if any are selected
    if (selectedGrades.length > 0) {
      filtered = filtered.filter(route => selectedGrades.includes(route.level));
    }

    // Filter by styles if any are selected
    if (selectedStyles.length > 0) {
      filtered = filtered.filter(route => {
        const routeStyle = route.climbingStyle.toLowerCase();
        return selectedStyles.some(style => style.toLowerCase() === routeStyle);
      });
    }

    return filtered;
  };

  // Filter zones to only show zones with routes matching the filters
  const getFilteredZones = (): Zone[] => {
    // If no filters are active, return all zones
    if (selectedGrades.length === 0 && selectedStyles.length === 0) {
      return zones;
    }

    return zones.map(zone => {
      // Filter routes within each zone
      const filteredRoutes = zone.routes.filter(route => {
        let matches = true;

        // Check grade filter
        if (selectedGrades.length > 0 && !selectedGrades.includes(route.level)) {
          matches = false;
        }

        // Check style filter
        if (matches && selectedStyles.length > 0) {
          const routeStyle = route.climbingStyle.toLowerCase();
          matches = selectedStyles.some(style => style.toLowerCase() === routeStyle);
        }

        return matches;
      });

      return {
        ...zone,
        routes: filteredRoutes,
      };
    }).filter(zone => zone.routes.length > 0); // Only include zones that have matching routes
  };

  // Sort routes based on active view
  const getSortedRoutes = () => {
    const allRoutes = getAllRoutes();
    const filteredRoutes = getFilteredRoutes(allRoutes);
    
    if (activeView === 'mostClimbed') {
      return filteredRoutes.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.numberOfSends - a.numberOfSends 
          : a.numberOfSends - b.numberOfSends;
      });
    }
    
    if (activeView === 'level') {
      return filteredRoutes.sort((a, b) => {
        const levelA = parseInt(a.level.replace('L', ''));
        const levelB = parseInt(b.level.replace('L', ''));
        return sortOrder === 'desc' 
          ? levelB - levelA 
          : levelA - levelB;
      });
    }
    
    return filteredRoutes;
  };

  // Show login button if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please log in to view routes</Text>
        <Button 
          text="Go to Login" 
          onPress={() => router.push('/login')}
          variant="primary"
        />
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterOptions}>
          <ActionPill
            text="Zones"
            isSelected={activeView === 'zones'}
            onPress={() => handleFilterPress('zones')}
          />
          <ActionPill
            text="Most Climbed"
            isSelected={activeView === 'mostClimbed'}
            onPress={() => handleFilterPress('mostClimbed')}
            icon={<SortIcon size={16} color={activeView === 'mostClimbed' ? Theme.colors.neutral.white : Theme.colors.primary[500]} />}
          />
          <ActionPill
            text="Level"
            isSelected={activeView === 'level'}
            onPress={() => handleFilterPress('level')}
            icon={<SortIcon size={16} color={activeView === 'level' ? Theme.colors.neutral.white : Theme.colors.primary[500]} />}
          />
        </View>
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          accessibilityLabel="Additional filters"
          accessibilityHint="Opens filter menu"
        >
          <FilterIcon size={24} color={Theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Content - Zones or Sorted Routes List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.zonesContainer}
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
            <Text style={styles.loadingText}>Loading routes...</Text>
          </View>
        ) : activeView === 'zones' ? (
          // Zone Accordion View
          (() => {
            const filteredZones = getFilteredZones();
            return filteredZones.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No routes match your filters</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filter selections</Text>
              </View>
            ) : (
              filteredZones.map((zone) => (
                <ZoneAccordion
                  key={zone.id}
                  zoneName={zone.name}
                  dateSet={zone.dateSet}
                  isOpen={zone.isOpen}
                  onToggle={() => toggleZone(zone.id)}
                >
                  {zone.routes.map((route) => (
                    <RouteListItem
                      key={route.id}
                      colour={route.colour}
                      level={route.level}
                      difficulty={route.difficulty}
                      climbingStyle={route.climbingStyle}
                      numberOfSends={route.numberOfSends}
                      isSent={route.isSent}
                      isSaved={route.isSaved}
                      onAscentPress={() => handleAscentToggle(zone.id, route.id)}
                      onSavePress={() => {/* TODO: Implement save functionality */}}
                    />
                  ))}
                </ZoneAccordion>
              ))
            );
          })()
        ) : (
          // Flat Sorted Routes List
          <View style={styles.flatRoutesContainer}>
            {getSortedRoutes().length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No routes available</Text>
                <Text style={styles.emptySubtext}>Check back later for new routes</Text>
              </View>
            ) : (
              getSortedRoutes().map((route) => (
                <RouteListItem
                  key={`${route.zoneId}-${route.id}`}
                  colour={route.colour}
                  level={route.level}
                  difficulty={route.difficulty}
                  climbingStyle={route.climbingStyle}
                  zone={route.zoneName}
                  showZone={true}
                  numberOfSends={route.numberOfSends}
                  isSent={route.isSent}
                  isSaved={route.isSaved}
                  onAscentPress={() => handleAscentToggle(route.zoneId, route.id)}
                  onSavePress={() => {/* TODO: Implement save functionality */}}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Ascent Modal */}
      <AddAscentModal
        visible={modalVisible}
        level={selectedRoute.route?.level || ''}
        colour={selectedRoute.route?.colour || '#000000'}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
        difficultyOptions={['Easy', 'Medium', 'Hard']}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        selectedGrades={selectedGrades}
        selectedStyles={selectedStyles}
        onApplyFilters={(grades, styles) => {
          setSelectedGrades(grades);
          setSelectedStyles(styles);
        }}
        onClose={() => setFilterModalVisible(false)}
      />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create<{
  outerContainer: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  locationInput: ViewStyle;
  mapButton: ViewStyle;
  filtersContainer: ViewStyle;
  filterOptions: ViewStyle;
  scrollView: ViewStyle;
  zonesContainer: ViewStyle;
  flatRoutesContainer: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  emptySubtext: TextStyle;
  authContainer: ViewStyle;
  authText: TextStyle;
}>({
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
  outerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  container: {
    flex: 1,
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
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
    backgroundColor: Theme.colors.neutral.white,
  },
  filterOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  zonesContainer: {
    gap: 20,
    paddingBottom: 24,
    backgroundColor: Theme.colors.neutral.white,
  },
  flatRoutesContainer: {
    backgroundColor: Theme.colors.neutral.white,
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
