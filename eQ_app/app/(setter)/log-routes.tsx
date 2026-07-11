/**
 * Log Routes Screen (setter-facing)
 * Lists routes staged for the selected zone. Allows adding new routes (navigates
 * to the route form) or deleting/editing staged ones. Also shows the Next Reset
 * Date picker (same widget as EditZoneModal) so setters can update it in context.
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=471-6418
 */

import { Button, ChevronLeftIcon, LogRouteListItem, ThemedText } from '@/components';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { Theme } from '@/constants';
import { deleteBoulder, getBoulders, updateZone, resetZone, Boulder } from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import logger from '@/services/logger';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Date helpers (mirrors EditZoneModal) ─────────────────────────────────────

function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(-2)}`;
}

function parseIso(iso: string | null): { year: number; month: number; day: number } {
  if (iso) {
    const parts = iso.split('-');
    if (parts.length === 3) {
      return { year: Number(parts[0]), month: Number(parts[1]), day: Number(parts[2]) };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ITEM_H = 44;

// ─── Wheel column ─────────────────────────────────────────────────────────────

interface WheelColProps {
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}

function WheelCol({ items, selectedIndex, onSelect }: WheelColProps) {
  const ref = React.useRef<FlatList>(null);
  useEffect(() => {
    ref.current?.scrollToIndex({ index: selectedIndex, animated: false });
  }, [selectedIndex]);
  return (
    <FlatList
      ref={ref}
      data={items}
      keyExtractor={(_, i) => String(i)}
      style={styles.wheelCol}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      getItemLayout={(_, i) => ({ length: ITEM_H, offset: ITEM_H * i, index: i })}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
        onSelect(Math.max(0, Math.min(idx, items.length - 1)));
      }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onSelect(index)}
          style={[styles.wheelItem, index === selectedIndex && styles.wheelItemSelected]}
        >
          <Text style={[styles.wheelText, index === selectedIndex && styles.wheelTextSelected]}>
            {item}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

// ─── Date picker sheet ────────────────────────────────────────────────────────

interface DatePickerSheetProps {
  year: number;
  month: number;
  day: number;
  onChange: (y: number, m: number, d: number) => void;
  onDone: () => void;
}

function DatePickerSheet({ year, month, day, onChange, onDone }: DatePickerSheetProps) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => String(currentYear + i)), [currentYear]);
  const days = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => String(i + 1).padStart(2, '0')),
    [year, month],
  );
  const yIdx = years.indexOf(String(year));
  const mIdx = month - 1;
  const dIdx = Math.min(day - 1, days.length - 1);

  return (
    <View style={styles.pickerSheet}>
      <View style={styles.pickerHeader}>
        <ThemedText variant="heading2">Select Date</ThemedText>
        <TouchableOpacity onPress={onDone} hitSlop={8}>
          <ThemedText variant="button" style={styles.pickerDone}>Done</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.pickerCols}>
        <View style={styles.pickerHighlight} pointerEvents="none" />
        <WheelCol items={days} selectedIndex={dIdx} onSelect={(i) => onChange(year, month, i + 1)} />
        <WheelCol
          items={MONTHS}
          selectedIndex={mIdx}
          onSelect={(i) => {
            const newDay = Math.min(day, daysInMonth(year, i + 1));
            onChange(year, i + 1, newDay);
          }}
        />
        <WheelCol
          items={years}
          selectedIndex={yIdx >= 0 ? yIdx : 0}
          onSelect={(i) => {
            const y = Number(years[i]);
            onChange(y, month, Math.min(day, daysInMonth(y, month)));
          }}
        />
      </View>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalizeFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LogRoutesScreen() {
  const router = useRouter();
  const { zoneId, zoneName, nextReset } = useLocalSearchParams<{
    zoneId: string;
    zoneName: string;
    nextReset: string;
  }>();
  const wallId = zoneId ? parseInt(zoneId, 10) : undefined;

  // Routes
  const [routes, setRoutes] = useState<Boulder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // IDs of DB routes the user has removed locally (committed on Mark as Set)
  const pendingDeletes = useRef<Set<number>>(new Set());

  // Date picker
  const [dateparts, setDateparts] = useState(() => parseIso(nextReset || null));
  const [showPicker, setShowPicker] = useState(false);
  // Track whether the user changed the date so we know to save it
  const dateChanged = useRef(false);

  const displayDate = isoToDisplay(toIso(dateparts.year, dateparts.month, dateparts.day));

  const loadRoutes = useCallback(async () => {
    if (!wallId) return;
    try {
      setError(null);
      const all = await getBoulders({ wall: wallId, is_active: true });
      setRoutes(all);
    } catch (err) {
      logger.error('[LogRoutes] failed to load routes', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [wallId]);

  useFocusEffect(
    useCallback(() => { loadRoutes(); }, [loadRoutes]),
  );

  const handleRefresh = useCallback(() => { setRefreshing(true); loadRoutes(); }, [loadRoutes]);

  const handleDateDone = useCallback(() => {
    setShowPicker(false);
    dateChanged.current = true;
  }, []);

  const handleDelete = useCallback((boulder: Boulder) => {
    // Stage the deletion locally — committed on Mark as Set
    pendingDeletes.current.add(boulder.id);
    setRoutes((prev) => prev.filter((b) => b.id !== boulder.id));
  }, []);

  const handleClearAll = useCallback(() => {
    if (routes.length === 0) return;
    // Stage all current routes for deletion — committed on Mark as Set
    routes.forEach((b) => pendingDeletes.current.add(b.id));
    setRoutes([]);
  }, [routes]);

  const handleAddRoute = useCallback(() => {
    router.push({
      pathname: '/(setter)/log-route-form',
      params: { zoneId: String(wallId), zoneName: zoneName ?? '' },
    });
  }, [router, wallId, zoneName]);

  const [markingSet, setMarkingSet] = useState(false);
  const handleMarkAsSet = useCallback(() => {
    if (!wallId) return;
    Alert.alert(
      'Mark as Set',
      'This will record today as the last set date and deactivate all active routes in this zone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Set',
          style: 'default',
          onPress: async () => {
            setMarkingSet(true);
            try {
              // Commit staged deletions
              if (pendingDeletes.current.size > 0) {
                await Promise.all([...pendingDeletes.current].map((id) => deleteBoulder(id)));
                pendingDeletes.current.clear();
              }
              await resetZone(wallId);
              // Save the date override AFTER resetZone so it isn't overwritten
              // by the computed next_reset the backend calculates during reset.
              if (dateChanged.current) {
                await updateZone(wallId, { next_reset: toIso(dateparts.year, dateparts.month, dateparts.day) });
              }
              router.back();
            } catch (err) {
              logger.error('[LogRoutes] mark as set failed', err);
              Alert.alert('Error', getErrorMessage(err));
            } finally {
              setMarkingSet(false);
            }
          },
        },
      ],
    );
  }, [wallId, router, dateparts]);

  const handleEdit = useCallback((boulder: Boulder) => {
    router.push({
      pathname: '/(setter)/log-route-form',
      params: {
        zoneId: String(wallId),
        zoneName: zoneName ?? '',
        boulderId: String(boulder.id),
        initialColour: boulder.color,
        initialGrade: boulder.setter_grade,
        initialDifficulty: boulder.difficulty,
        initialStyle: boulder.climbing_style,
      },
    });
  }, [router, wallId, zoneName]);

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
        <ThemedText variant="heading1">Log Routes</ThemedText>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Theme.colors.primary[500]}
          />
        }
      >
        {/* Zone name + Clear List */}
        <View style={styles.subHeader}>
          <ThemedText variant="heading2">{zoneName ?? `Zone ${wallId}`}</ThemedText>
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
            <ThemedText variant="button" style={styles.clearText}>Clear List</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Next Reset Date picker */}
        <View style={styles.dateSection}>
          <View style={styles.dateFieldGroup}>
            <ThemedText variant="subtext2" style={styles.dateLabel}>Next Reset Date</ThemedText>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowPicker((v) => !v)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select next reset date"
            >
              <ThemedText variant="body1" style={styles.dateValue}>
                {displayDate || 'Select date'}
              </ThemedText>
              <CalendarIcon />
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DatePickerSheet
              year={dateparts.year}
              month={dateparts.month}
              day={dateparts.day}
              onChange={(y, m, d) => setDateparts({ year: y, month: m, day: d })}
              onDone={handleDateDone}
            />
          )}
        </View>

        {/* Route list */}
        {loading ? (
          <ActivityIndicator color={Theme.colors.primary[500]} style={styles.loader} />
        ) : error ? (
          <View style={styles.center}>
            <ThemedText variant="body1" style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : (
          <>
            {routes.length === 0 && (
              <View style={styles.center}>
                <ThemedText variant="body1" style={styles.emptyText}>
                  No routes logged yet.
                </ThemedText>
              </View>
            )}
            {routes.map((boulder) => (
              <LogRouteListItem
                key={boulder.id}
                colour={boulder.color}
                grade={boulder.setter_grade}
                difficulty={capitalizeFirst(boulder.difficulty)}
                climbingStyle={capitalizeFirst(boulder.climbing_style)}
                onDelete={() => handleDelete(boulder)}
                onEdit={() => handleEdit(boulder)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Add Route button */}
      <View style={styles.footer}>
        <Button text="+ Add route" onPress={handleAddRoute} fullWidth />
        {markingSet
          ? <ActivityIndicator color={Theme.colors.primary[500]} />
          : <Button text="Mark as Set" onPress={handleMarkAsSet} fullWidth variant="secondary" />}
      </View>
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
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 0,
  },
  clearText: {
    color: Theme.colors.primary[500],
  },
  // Date picker
  dateSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateFieldGroup: {
    gap: 4,
  },
  dateLabel: {
    color: Theme.colors.neutral[900],
    marginBottom: 4,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.neutral[500],
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateValue: {
    color: Theme.colors.neutral[900],
    flex: 1,
  },
  // Wheel picker
  pickerSheet: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[300],
  },
  pickerDone: {
    color: Theme.colors.primary[500],
  },
  pickerCols: {
    flexDirection: 'row',
    height: ITEM_H * 5,
    position: 'relative',
    justifyContent: 'space-around',
  },
  pickerHighlight: {
    position: 'absolute',
    top: ITEM_H * 2,
    left: 0,
    right: 0,
    height: ITEM_H,
    backgroundColor: Theme.colors.neutral[100],
  },
  wheelCol: {
    flex: 1,
  },
  wheelItem: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemSelected: {},
  wheelText: {
    fontSize: 16,
    color: Theme.colors.neutral[500],
    fontFamily: 'Rubik_300Light',
  },
  wheelTextSelected: {
    color: Theme.colors.neutral[900],
    fontFamily: 'Rubik_500Medium',
  },
  // Misc
  loader: {
    marginTop: 40,
  },
  center: {
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[300],
    gap: 12,
  },
});

