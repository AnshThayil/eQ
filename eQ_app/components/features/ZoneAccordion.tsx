/**
 * ZoneAccordion component - Collapsible container for routes in a zone
 * Based on Figma designs:
 * - Closed: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=13-155
 * - Open: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=13-160
 * 
 * Displays:
 * - Zone name and date set
 * - Expandable/collapsible caret icon
 * - Child RouteListItem components when expanded
 */

import { Theme } from '@/constants/Theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { CaretDownIcon } from '../icons';
import { ThemedText } from '../basic/ThemedText';

export interface ZoneAccordionProps {
  /**
   * Name of the zone (e.g., "Zone 1")
   */
  zoneName: string;
  
  /**
   * Date the zone was set (e.g., "Set on 19/10/25")
   */
  dateSet: string;
  
  /**
   * Whether the accordion is expanded
   */
  isOpen: boolean;
  
  /**
   * Callback when the header is pressed to toggle open/closed state
   */
  onToggle: () => void;
  
  /**
   * RouteListItem components to display when expanded
   */
  children: React.ReactNode;
  
  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}

export function ZoneAccordion({
  zoneName,
  dateSet,
  isOpen,
  onToggle,
  children,
  style: styleProp,
}: ZoneAccordionProps) {
  const rotateAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const isFirstRender = useRef(true);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const hasMeasured = useRef(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOpen]);

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, measuredHeight],
  });

  const handleLayout = (h: number) => {
    if (h > 0 && !hasMeasured.current) {
      hasMeasured.current = true;
      setMeasuredHeight(h);
      heightAnim.setValue(isOpenRef.current ? 1 : 0);
    }
  };

  return (
    <View style={[styles.container, styleProp]}>
      {/* Zone Header - Clickable */}
      <Pressable
        style={styles.header}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${zoneName}, ${dateSet}, ${isOpen ? 'expanded' : 'collapsed'}`}
        accessibilityHint="Double tap to toggle zone routes"
      >
        {/* Zone Info */}
        <View style={styles.zoneInfo}>
          <ThemedText variant="heading2" style={styles.zoneName}>
            {zoneName}
          </ThemedText>
          <ThemedText variant="subtext1" style={styles.dateSet}>
            {dateSet}
          </ThemedText>
        </View>
        
        {/* Caret Icon */}
        <Animated.View style={[styles.caretContainer, { transform: [{ rotate: rotateDeg }] }]}>
          <CaretDownIcon
            size={24}
            color={Theme.semantic.text.primary}
          />
        </Animated.View>
      </Pressable>
      
      {/* Routes Container - always mounted, height animated */}
      <Animated.View style={[styles.routesContainer, { height: measuredHeight === 0 ? undefined : animatedHeight, overflow: 'hidden' }]}>
        <View
          onLayout={(e) => handleLayout(e.nativeEvent.layout.height)}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.neutral.white,
  },
  zoneInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0,
  },
  zoneName: {
    color: Theme.semantic.text.primary,
  },
  dateSet: {
    color: Theme.semantic.text.primary,
    height: 15,
  },
  caretContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routesContainer: {
    flexDirection: 'column',
    backgroundColor: Theme.colors.neutral.white,
    overflow: 'hidden',
  },
});
