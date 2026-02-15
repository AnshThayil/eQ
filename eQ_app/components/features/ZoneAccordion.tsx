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
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
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
        <View style={[styles.caretContainer, isOpen && styles.caretOpen]}>
          <CaretDownIcon
            size={24}
            color={Theme.semantic.text.primary}
          />
        </View>
      </Pressable>
      
      {/* Routes Container - Conditionally rendered */}
      {isOpen && (
        <View style={styles.routesContainer}>
          {children}
        </View>
      )}
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
    transform: [{ scaleY: 1 }], // Normal orientation when closed (pointing down)
  },
  caretOpen: {
    transform: [{ scaleY: -1 }], // Flipped when open (pointing up)
  },
  routesContainer: {
    flexDirection: 'column',
    backgroundColor: Theme.colors.neutral.white,
  },
});
