/**
 * SettingQueue - the drag-and-drop ordered list of zones for the setter
 * Setting Schedule screen.
 * https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=463-3295
 *
 * The schedule is a single ordered list. The first zone is rendered under the
 * "Up Next" header (with a Log Routes action); the rest under "Queue".
 * Long-press a card to lift it, drag to a new slot, and release to reorder.
 */

import { ThemedText } from '@/components/basic/ThemedText';
import { Theme } from '@/constants';
import type { Zone } from '@/services/api';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ResetWeekItem } from './ResetWeekItem';

export interface SettingQueueProps {
  zones: Zone[];
  /** Called with the new ordered list of zone ids after a drag completes. */
  onReorder: (orderedIds: number[]) => void;
  onEditZone: (zone: Zone) => void;
  onLogRoutes: (zone: Zone) => void;
  /** Notifies the parent when a drag begins/ends (to disable outer scrolling). */
  onDragActiveChange?: (active: boolean) => void;
  /**
   * How many zones reset together each week (comes from
   * ZoneScheduleResponse.zones_per_reset). Defaults to 2.
   * Used to determine which zones are "Up Next" (the first batch that share
   * the earliest reset date).
   */
  zonesPerReset?: number;
}

interface CardLayout {
  y: number;
  height: number;
}

export function SettingQueue({
  zones,
  onReorder,
  onEditZone,
  onLogRoutes,
  onDragActiveChange,
  zonesPerReset = 2,
}: SettingQueueProps) {
  const [data, setData] = useState<Zone[]>(zones);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Keep internal order in sync with props when not mid-drag.
  useEffect(() => {
    if (draggingId === null) {
      setData(zones);
    }
  }, [zones, draggingId]);

  const containerRef = useRef<View>(null);
  const containerPageY = useRef(0);
  // Card layouts (relative to the container), keyed by zone id.
  const layouts = useRef<Map<number, CardLayout>>(new Map());

  const floatY = useSharedValue(0);
  const floatStartY = useSharedValue(0);

  const draggingIdRef = useRef<number | null>(null);

  const measureContainer = useCallback(() => {
    containerRef.current?.measureInWindow((_x, y) => {
      containerPageY.current = y;
    });
  }, []);

  const handleCardLayout = useCallback(
    (zoneId: number) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      layouts.current.set(zoneId, { y, height });
    },
    [],
  );

  /** Find the drop slot index (0..n) for a pointer at container-relative Y. */
  const computeDropIndex = useCallback(
    (relativeY: number): number => {
      let index = data.length;
      for (let i = 0; i < data.length; i++) {
        const layout = layouts.current.get(data[i].id);
        if (!layout) continue;
        const center = layout.y + layout.height / 2;
        if (relativeY < center) {
          index = i;
          break;
        }
      }
      return index;
    },
    [data],
  );

  const startDrag = useCallback(
    (zoneId: number) => {
      measureContainer();
      const layout = layouts.current.get(zoneId);
      floatStartY.value = layout ? layout.y : 0;
      floatY.value = 0;
      draggingIdRef.current = zoneId;
      setDraggingId(zoneId);
      const currentIndex = data.findIndex((z) => z.id === zoneId);
      setDropIndex(currentIndex);
      onDragActiveChange?.(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [data, floatStartY, floatY, measureContainer, onDragActiveChange],
  );

  const moveDrag = useCallback(
    (absoluteY: number) => {
      const relativeY = absoluteY - containerPageY.current;
      setDropIndex(computeDropIndex(relativeY));
    },
    [computeDropIndex],
  );

  const endDrag = useCallback(() => {
    const zoneId = draggingIdRef.current;
    if (zoneId === null) return;

    setData((current) => {
      const fromIndex = current.findIndex((z) => z.id === zoneId);
      if (fromIndex === -1) return current;

      let target = dropIndex ?? fromIndex;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      // Account for the removed item shifting indices above the target.
      if (target > fromIndex) target -= 1;
      target = Math.max(0, Math.min(target, next.length));
      next.splice(target, 0, moved);

      const changed = next.some((z, i) => z.id !== current[i].id);
      if (changed) {
        onReorder(next.map((z) => z.id));
      }
      return next;
    });

    draggingIdRef.current = null;
    setDraggingId(null);
    setDropIndex(null);
    onDragActiveChange?.(false);
  }, [dropIndex, onReorder, onDragActiveChange]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatStartY.value + floatY.value }],
  }));

  const draggingZone = draggingId !== null ? data.find((z) => z.id === draggingId) ?? null : null;

  // Determine "Up Next" boundary. During a live drag use stable position-based
  // grouping; at rest group by shared effective reset date.
  const firstResetDate = data.length > 0 ? data[0].next_reset : null;
  const isUpNextFn = (index: number) => {
    if (draggingId !== null) {
      return index < zonesPerReset;
    }
    const zone = data[index];
    return zone.next_reset !== null
      ? zone.next_reset === firstResetDate
      : index < zonesPerReset;
  };

  return (
    <View ref={containerRef} style={styles.container} onLayout={measureContainer} collapsable={false}>
      {data.map((zone, index) => {
        const upNext = isUpNextFn(index);
        const isDragging = zone.id === draggingId;
        const showUpNextLabel = index === 0;
        const prevUpNext = index > 0 ? isUpNextFn(index - 1) : true;
        const showQueueLabel = !upNext && prevUpNext;

        const pan = Gesture.Pan()
          .activateAfterLongPress(220)
          .onStart(() => {
            runOnJS(startDrag)(zone.id);
          })
          .onUpdate((e) => {
            floatY.value = e.translationY;
            runOnJS(moveDrag)(e.absoluteY);
          })
          .onEnd(() => {
            runOnJS(endDrag)();
          });

        return (
          <React.Fragment key={zone.id}>
            {showUpNextLabel && <SectionLabel text="Up Next" />}
            {showQueueLabel && <SectionLabel text="Queue" />}

            {dropIndex === index && draggingId !== null && !isDragging && (
              <View style={styles.dropIndicator} />
            )}

            <Animated.View
              layout={LinearTransition.duration(200)}
              onLayout={handleCardLayout(zone.id)}
              style={isDragging && styles.cardPlaceholder}
            >
              <GestureDetector gesture={pan}>
                <Animated.View>
                  <ResetWeekItem
                    zoneName={zone.name}
                    lastSet={zone.last_set}
                    nextReset={zone.next_reset}
                    showLogRoutes={upNext}
                    onEdit={() => onEditZone(zone)}
                    onLogRoutes={() => onLogRoutes(zone)}
                  />
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          </React.Fragment>
        );
      })}

      {/* Drop indicator at the very end of the list. */}
      {dropIndex === data.length && draggingId !== null && <View style={styles.dropIndicator} />}

      {/* Floating copy of the card being dragged. */}
      {draggingZone && (
        <Animated.View style={[styles.floating, floatStyle]} pointerEvents="none">
          <ResetWeekItem
            zoneName={draggingZone.name}
            lastSet={draggingZone.last_set}
            nextReset={draggingZone.next_reset}
            showLogRoutes={isUpNextFn(data.findIndex((z) => z.id === draggingZone.id))}
            isActive
          />
        </Animated.View>
      )}
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <ThemedText variant="heading2" style={styles.sectionLabel}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  sectionLabel: {
    color: Theme.colors.neutral[900],
    marginTop: 8,
  },
  cardPlaceholder: {
    opacity: 0,
  },
  floating: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  dropIndicator: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary[500],
    width: '100%',
  },
});
