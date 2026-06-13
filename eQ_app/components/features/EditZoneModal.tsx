/**
 * EditZoneModal - bottom-sheet style modal for editing a zone's next reset date
 * and "mark as up next" flag.
 * Based on Figma design:
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=470-6337
 */

import { ThemedText } from '@/components/basic/ThemedText';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { Theme } from '@/constants';
import { updateZone, Zone, ZoneScheduleResponse } from '@/services/api';
import { getErrorMessage } from '@/services/errors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Wheel picker col
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Date picker sheet (shown inside modal when calendar icon tapped)
// ---------------------------------------------------------------------------
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
  const months = MONTHS;
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
        <ThemedText variant="heading2" style={styles.pickerTitle}>Select Date</ThemedText>
        <TouchableOpacity onPress={onDone} hitSlop={8}>
          <ThemedText variant="button" style={styles.pickerDone}>Done</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Highlight bar */}
      <View style={styles.pickerCols}>
        <View style={styles.pickerHighlight} pointerEvents="none" />
        <WheelCol
          items={days}
          selectedIndex={dIdx}
          onSelect={(i) => onChange(year, month, i + 1)}
        />
        <WheelCol
          items={months}
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
            const newDay = Math.min(day, daysInMonth(y, month));
            onChange(y, month, newDay);
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
export interface EditZoneModalProps {
  visible: boolean;
  zone: Zone | null;
  /** Whether this zone is currently in the "Up Next" group. */
  isUpNext?: boolean;
  onClose: () => void;
  onSaved: (response: ZoneScheduleResponse) => void;
}

export function EditZoneModal({ visible, zone, isUpNext = false, onClose, onSaved }: EditZoneModalProps) {

  const [dateparts, setDateparts] = useState(() => parseIso(zone?.next_reset ?? null));
  const [markUpNext, setMarkUpNext] = useState(isUpNext);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state whenever the zone (or its up-next status) changes.
  useEffect(() => {
    if (zone) {
      setDateparts(parseIso(zone.next_reset));
      setMarkUpNext(isUpNext);
      setShowPicker(false);
      setError(null);
    }
  }, [zone, isUpNext]);

  const handleSave = useCallback(async () => {
    if (!zone) return;
    setSaving(true);
    setError(null);
    try {
      const iso = toIso(dateparts.year, dateparts.month, dateparts.day);
      const response = await updateZone(zone.id, {
        next_reset: iso,
        mark_up_next: markUpNext || undefined,
      });
      onSaved(response);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [zone, dateparts, markUpNext, onSaved, onClose]);

  if (!zone) return null;

  const displayDate = isoToDisplay(toIso(dateparts.year, dateparts.month, dateparts.day));
  const lastSetDisplay = isoToDisplay(zone.last_set);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Scrim */}
      <Pressable style={styles.scrim} onPress={onClose} />

      {/* Centered card */}
      <View style={styles.centered} pointerEvents="box-none">
        <View style={styles.card}>
        {/* Zone heading */}
        <ThemedText variant="heading2" style={styles.zoneName}>{zone.name}</ThemedText>

        {/* Last set */}
        <ThemedText variant="body1" style={styles.lastSet}>
          Last set: {lastSetDisplay || '—'}
        </ThemedText>

        {/* Next Reset Date field */}
        <View style={styles.fieldGroup}>
          <ThemedText variant="subtext2" style={styles.fieldLabel}>Next Reset Date</ThemedText>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setShowPicker((v) => !v)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Select next reset date"
          >
            <ThemedText variant="body1" style={styles.dateText}>{displayDate}</ThemedText>
            <CalendarIcon />
          </TouchableOpacity>

          {showPicker && (
            <DatePickerSheet
              year={dateparts.year}
              month={dateparts.month}
              day={dateparts.day}
              onChange={(y, m, d) => setDateparts({ year: y, month: m, day: d })}
              onDone={() => setShowPicker(false)}
            />
          )}
        </View>

        {/* Mark as up next */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setMarkUpNext((v) => !v)}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: markUpNext }}
        >
          <View style={[styles.checkbox, markUpNext && styles.checkboxChecked]}>
            {markUpNext && (
              <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <Path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </View>
          <ThemedText variant="body1" style={styles.checkLabel}>Mark as up next</ThemedText>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnSave}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText variant="button" style={styles.btnSaveText}>Save</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancel}
            onPress={onClose}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText variant="button" style={styles.btnCancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: 8,
    padding: 16,
    gap: 20,
    // Card shadow from Figma
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  zoneName: {
    color: Theme.colors.neutral[900],
  },
  lastSet: {
    color: Theme.colors.neutral[900],
    marginTop: -8,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    color: Theme.colors.neutral[900],
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
  dateText: {
    color: Theme.colors.neutral[900],
  },
  // ---------- date picker wheel ----------
  pickerSheet: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[300],
    marginTop: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pickerTitle: {
    color: Theme.colors.neutral[900],
    fontSize: 16,
  },
  pickerDone: {
    color: Theme.colors.primary[500],
  },
  pickerCols: {
    flexDirection: 'row',
    height: ITEM_H * 3,
    overflow: 'hidden',
  },
  pickerHighlight: {
    position: 'absolute',
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: 4,
    zIndex: 0,
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
    fontFamily: 'Rubik-Light',
    fontSize: 16,
    color: Theme.colors.neutral[500],
  },
  wheelTextSelected: {
    fontFamily: 'Rubik-Medium',
    color: Theme.colors.neutral[900],
  },
  // ---------- checkbox ----------
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: Theme.colors.secondary[500],
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.secondary[500],
  },
  checkLabel: {
    color: Theme.colors.neutral[900],
  },
  // ---------- error ----------
  errorText: {
    color: Theme.colors.error?.[700] ?? '#b91c1c',
    fontSize: 13,
    marginTop: -8,
  },
  // ---------- actions ----------
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: -8,
  },
  btnSave: {
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minWidth: 81,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveText: {
    color: Theme.colors.neutral.white,
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    color: Theme.colors.primary[500],
  },
});
