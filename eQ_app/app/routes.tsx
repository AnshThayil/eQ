/**
 * Routes Screen - Main screen for viewing climbing routes organized by zones
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=13-144
 */

import { ActionPill } from '@/components/ActionPill';
import { CaretDownIcon, FilterIcon, LocationPinIcon, MapIcon, SortIcon } from '@/components/icons';
import { InputField } from '@/components/InputField';
import { RouteListItem } from '@/components/RouteListItem';
import { ZoneAccordion } from '@/components/ZoneAccordion';
import { Theme } from '@/constants';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Route {
  id: string;
  colour: string;
  level: string;
  difficulty: string;
  climbingStyle: string;
  numberOfSends: number;
  isSent: boolean;
}

interface Zone {
  id: string;
  name: string;
  dateSet: string;
  isOpen: boolean;
  routes: Route[];
}

// Mock data - replace with actual data from your backend
const MOCK_ZONES: Zone[] = [
  {
    id: '1',
    name: 'Zone 1',
    dateSet: 'Set on 19/10/25',
    isOpen: true,
    routes: [
      {
        id: '1-1',
        colour: '#FF8C42',
        level: 'L3',
        difficulty: 'Hard',
        climbingStyle: 'Technical',
        numberOfSends: 8,
        isSent: false,
      },
      {
        id: '1-2',
        colour: '#4A90E2',
        level: 'L2',
        difficulty: 'Easy',
        climbingStyle: 'Power',
        numberOfSends: 12,
        isSent: false,
      },
      {
        id: '1-3',
        colour: '#FF6B9D',
        level: 'L5',
        difficulty: 'Medium',
        climbingStyle: 'Slab',
        numberOfSends: 5,
        isSent: false,
      },
      {
        id: '1-4',
        colour: '#9B59B6',
        level: 'L3',
        difficulty: 'Easy',
        climbingStyle: 'Coordination',
        numberOfSends: 14,
        isSent: true,
      },
      {
        id: '1-5',
        colour: '#E74C3C',
        level: 'L6',
        difficulty: 'Medium',
        climbingStyle: 'Power',
        numberOfSends: 7,
        isSent: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Zone 2',
    dateSet: 'Set on 12/10/25',
    isOpen: false,
    routes: [],
  },
  {
    id: '3',
    name: 'Zone 3',
    dateSet: 'Set on 5/10/25',
    isOpen: false,
    routes: [],
  },
  {
    id: '4',
    name: 'Zone 4',
    dateSet: 'Set on 28/9/25',
    isOpen: false,
    routes: [],
  },
];

const LOCATION_OPTIONS = ['Placeholder', 'Main Wall', 'Cave', 'Overhang'];

export default function RoutesScreen() {
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [selectedLocation, setSelectedLocation] = useState('Placeholder');
  const [activeView, setActiveView] = useState<'zones' | 'mostClimbed' | 'level'>('zones');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // For ascending/descending sort

  const toggleZone = (zoneId: string) => {
    setZones(
      zones.map((zone) =>
        zone.id === zoneId ? { ...zone, isOpen: !zone.isOpen } : zone
      )
    );
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

  // Sort routes based on active view
  const getSortedRoutes = () => {
    const allRoutes = getAllRoutes();
    
    if (activeView === 'mostClimbed') {
      return allRoutes.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.numberOfSends - a.numberOfSends 
          : a.numberOfSends - b.numberOfSends;
      });
    }
    
    if (activeView === 'level') {
      return allRoutes.sort((a, b) => {
        const levelA = parseInt(a.level.replace('L', ''));
        const levelB = parseInt(b.level.replace('L', ''));
        return sortOrder === 'desc' 
          ? levelB - levelA 
          : levelA - levelB;
      });
    }
    
    return allRoutes;
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <InputField
          type="dropdown"
          placeholder={selectedLocation}
          value={selectedLocation}
          leftIcon={<LocationPinIcon size={24} color={Theme.colors.secondary[500]} />}
          rightIcon={<CaretDownIcon size={24} color={Theme.colors.neutral.black} />}
          options={LOCATION_OPTIONS}
          onSelectOption={setSelectedLocation}
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
      >
        {activeView === 'zones' ? (
          // Zone Accordion View
          zones.map((zone) => (
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
                  onAscentPress={() => toggleRouteAscent(zone.id, route.id)}
                />
              ))}
            </ZoneAccordion>
          ))
        ) : (
          // Flat Sorted Routes List
          <View style={styles.flatRoutesContainer}>
            {getSortedRoutes().map((route) => (
              <RouteListItem
                key={`${route.zoneId}-${route.id}`}
                colour={route.colour}
                level={route.level}
                difficulty={route.difficulty}
                climbingStyle={route.climbingStyle}
                numberOfSends={route.numberOfSends}
                isSent={route.isSent}
                onAscentPress={() => toggleRouteAscent(route.zoneId, route.id)}
              />
            ))}
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
});
