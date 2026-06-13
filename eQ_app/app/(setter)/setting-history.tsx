/**
 * Setting History Screen (setter-facing)
 * Lists all past setting sessions grouped by date. Tapping "View Details"
 * opens a modal with the full list of routes set on that day.
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=470-5891
 */

import { ChevronLeftIcon, SettingHistoryListItem, ThemedText } from '@/components';
import { StaticPill } from '@/components/basic/StaticPill';
import { HoldIcon } from '@/components/icons';
import { Theme } from '@/constants';
import {
  Boulder,
  getSettingHistory,
  getSettingHistoryDetail,
  SettingHistoryEntry,
} from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import logger from '@/services/logger';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  entry: SettingHistoryEntry | null;
  onClose: () => void;
}

function DetailModal({ entry, onClose }: DetailModalProps) {
  const [routes, setRoutes] = useState<Boulder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    setLoading(true);
    setError(null);
    getSettingHistoryDetail(entry.date)
      .then((data) => setRoutes(data.routes))
      .catch((err) => {
        logger.error('[SettingHistory] failed to load detail', err);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [entry]);

  function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  }

  return (
    <Modal
      visible={entry !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <ThemedText variant="heading2">
              {entry ? formatDate(entry.date) : ''}
            </ThemedText>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <ThemedText variant="button" style={styles.closeButton}>
                Close
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Meta */}
          {entry && (
            <View style={styles.modalMeta}>
              {entry.setters.length > 0 && (
                <ThemedText variant="body2" style={styles.metaText}>
                  {`Setters: ${entry.setters.join(', ')}`}
                </ThemedText>
              )}
              {entry.zones.length > 0 && (
                <ThemedText variant="body2" style={styles.metaText}>
                  {`Zones: ${entry.zones.join(', ')}`}
                </ThemedText>
              )}
              <ThemedText variant="body2" style={styles.metaText}>
                {`Routes: ${entry.route_count}`}
              </ThemedText>
            </View>
          )}

          {/* Route list */}
          <ScrollView contentContainerStyle={styles.modalScrollContent} style={styles.modalScroll}>
            {loading && <ActivityIndicator color={Theme.colors.primary[500]} style={styles.loader} />}
            {error && (
              <ThemedText variant="body1" style={styles.errorText}>
                {error}
              </ThemedText>
            )}
            {!loading && !error && routes.length === 0 && (
              <ThemedText variant="body1" style={styles.emptyText}>
                No routes found.
              </ThemedText>
            )}
            {!loading &&
              routes.map((boulder) => (
                <View key={boulder.id} style={styles.routeRow}>
                  <View style={styles.routeRowLeft}>
                    <HoldIcon size={20} color={boulder.color} />
                    <ThemedText variant="body2" style={styles.routeGrade}>
                      {boulder.setter_grade}
                    </ThemedText>
                    {boulder.difficulty ? (
                      <StaticPill text={boulder.difficulty} size="small" />
                    ) : null}
                  </View>
                  <View style={styles.routeRowRight}>
                    {boulder.wall_details?.name ? (
                      <ThemedText variant="subtext2" style={styles.routeZone}>
                        {boulder.wall_details.name}
                      </ThemedText>
                    ) : null}
                    {boulder.climbing_style ? (
                      <ThemedText variant="subtext2" style={styles.routeStyle}>
                        {boulder.climbing_style}
                      </ThemedText>
                    ) : null}
                    <View style={[styles.statusBadge, boulder.is_active ? styles.statusActive : styles.statusRetired]}>
                      <ThemedText variant="subtext2" style={boulder.is_active ? styles.statusActiveText : styles.statusRetiredText}>
                        {boulder.is_active ? 'Active' : 'Retired'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingHistoryScreen() {
  const router = useRouter();

  const [history, setHistory] = useState<SettingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<SettingHistoryEntry | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const data = await getSettingHistory();
      setHistory(data.history);
    } catch (err) {
      logger.error('[SettingHistory] failed to load', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeftIcon size={24} color={Theme.colors.neutral[900]} />
        </TouchableOpacity>
        <ThemedText variant="heading1">Setting History</ThemedText>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator
          color={Theme.colors.primary[500]}
          style={styles.centerLoader}
        />
      ) : error ? (
        <View style={styles.centerContent}>
          <ThemedText variant="body1" style={styles.errorText}>
            {error}
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary[500]}
            />
          }
        >
          {history.length === 0 && (
            <View style={styles.centerContent}>
              <ThemedText variant="body1" style={styles.emptyText}>
                No setting history yet.
              </ThemedText>
            </View>
          )}
          {history.map((entry) => (
            <SettingHistoryListItem
              key={entry.date}
              date={entry.date}
              zones={entry.zones}
              routeCount={entry.route_count}
              onViewDetails={() => setSelectedEntry(entry)}
            />
          ))}
        </ScrollView>
      )}

      {/* Detail modal */}
      <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  header: {
    height: 72,
    backgroundColor: Theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 24,
  },
  centerLoader: {
    marginTop: 40,
  },
  centerContent: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: Theme.colors.primary[500],
    textAlign: 'center',
  },
  emptyText: {
    color: Theme.colors.neutral[500],
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  modalCard: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    ...Theme.shadow.lg,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
  },
  closeButton: {
    color: Theme.colors.primary[500],
  },
  modalMeta: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
    gap: 2,
  },
  metaText: {
    color: Theme.colors.neutral[700],
  },
  modalScrollContent: {
    paddingBottom: 16,
  },
  loader: {
    marginTop: 24,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  routeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeGrade: {
    color: Theme.colors.neutral[900],
    marginRight: 4,
  },
  routeRowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  routeZone: {
    color: Theme.colors.neutral[700],
  },
  routeStyle: {
    color: Theme.colors.neutral[500],
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  statusActive: {
    backgroundColor: Theme.colors.success[100],
  },
  statusRetired: {
    backgroundColor: Theme.colors.neutral[100],
  },
  statusActiveText: {
    color: Theme.colors.success[700],
  },
  statusRetiredText: {
    color: Theme.colors.neutral[500],
  },
});
