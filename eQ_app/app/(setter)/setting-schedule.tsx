/**
 * Setting Schedule Screen (setter-facing)
 * Shows the ordered queue of zones split into "Up Next" and "Queue", with
 * drag-and-drop reordering, per-zone reset dates, and a Log Routes action.
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=463-3295
 */

import { ChevronLeftIcon, EditZoneModal, HistoryIcon, SettingQueue, ThemedText } from '@/components';
import { Theme } from '@/constants';
import { getZones, reorderZones, Zone } from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import logger from '@/services/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingScheduleScreen() {
  const router = useRouter();

  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesPerReset, setZonesPerReset] = useState(2);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [isEditingUpNext, setIsEditingUpNext] = useState(false);

  const loadZones = useCallback(async () => {
    try {
      setError(null);
      const savedGymId = await AsyncStorage.getItem('selectedGymId');
      const gymId = savedGymId ? parseInt(savedGymId, 10) : undefined;
      const response = await getZones(gymId);
      setZones(response.zones);
      setZonesPerReset(response.zones_per_reset ?? 2);
    } catch (err) {
      logger.error('[SettingSchedule] failed to load zones', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadZones();
    }, [loadZones]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadZones();
  }, [loadZones]);

  const handleReorder = useCallback(
    async (orderedIds: number[]) => {
      // Optimistically reflect the new order.
      setZones((current) => {
        const byId = new Map(current.map((z) => [z.id, z]));
        return orderedIds.map((id) => byId.get(id)!).filter(Boolean);
      });
      try {
        const response = await reorderZones(orderedIds);
        setZones(response.zones);
      } catch (err) {
        logger.error('[SettingSchedule] reorder failed', err);
        setError(getErrorMessage(err));
        loadZones();
      }
    },
    [loadZones],
  );

  const handleEditZone = useCallback((zone: Zone) => {
    const idx = zones.findIndex((z) => z.id === zone.id);
    setIsEditingUpNext(idx >= 0 && idx < zonesPerReset);
    setEditingZone(zone);
  }, [zones, zonesPerReset]);

  const handleLogRoutes = useCallback((zone: Zone) => {
    logger.info('[SettingSchedule] log routes', zone.id);
    router.push({
      pathname: '/(setter)/log-routes',
      params: { zoneId: String(zone.id), zoneName: zone.name, nextReset: zone.next_reset ?? '' },
    });
  }, [router]);

  const handleOpenHistory = useCallback(() => {
    logger.info('[SettingSchedule] open history');
    router.push('/(setter)/setting-history');
  }, []);

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral[100]} />
      <SafeAreaView style={styles.container}>
        {/* Header — matches Figma node 463:3506: 72px neutral-100 bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <ChevronLeftIcon size={24} color={Theme.colors.primary[500]} />
          </TouchableOpacity>

          <ThemedText variant="heading1" style={styles.headerTitle}>
            Setting Schedule
          </ThemedText>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleOpenHistory}
            accessibilityRole="button"
            accessibilityLabel="Setting history"
            hitSlop={8}
          >
            <HistoryIcon size={24} color={Theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Theme.colors.primary[500]} />
            }
          >
            {zones.length === 0 ? (
              <ThemedText variant="body1" style={styles.emptyText}>
                No zones to schedule yet.
              </ThemedText>
            ) : (
              <SettingQueue
                zones={zones}
                zonesPerReset={zonesPerReset}
                onReorder={handleReorder}
                onEditZone={handleEditZone}
                onLogRoutes={handleLogRoutes}
                onDragActiveChange={(active) => setScrollEnabled(!active)}
              />
            )}
          </ScrollView>
        )}

        <EditZoneModal
          visible={editingZone !== null}
          zone={editingZone}
          isUpNext={isEditingUpNext}
          onClose={() => setEditingZone(null)}
          onSaved={(response) => {
            setZones(response.zones);
            setZonesPerReset(response.zones_per_reset ?? 2);
          }}
        />
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
    height: 72,
    backgroundColor: Theme.colors.neutral[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: Theme.colors.neutral[900],
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral.white,
  },
  emptyText: {
    color: Theme.colors.neutral[700],
    textAlign: 'center',
    marginTop: 40,
  },
  errorContainer: {
    backgroundColor: Theme.colors.error[100],
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    color: Theme.colors.error[700],
    fontSize: 14,
  },
});
