/**
 * InfoCard component - Displays information card with image
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=389-1606
 * 
 * A card component that shows:
 * - Title with an optional status pill
 * - List of detail items (e.g., sessions, time, location)
 * - Action button
 * - Image on the right side
 */

import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View, ViewStyle, Image, ImageSourcePropType, Pressable } from 'react-native';
import { ThemedText } from '../basic/ThemedText';
import { StaticPill } from '../basic/StaticPill';

export interface DetailItem {
  /**
   * Label for the detail (e.g., "Sessions:", "Slot:", "Location:")
   */
  label: string;
  
  /**
   * Value for the detail (e.g., "4/12", "6:00 PM", "EQ Hoodi")
   */
  value: string;
}

export interface InfoCardProps {
  /**
   * Main title text
   */
  title: string;
  
  /**
   * Label text for the status pill (optional)
   */
  pillLabel?: string;
  
  /**
   * Array of detail items to display
   */
  details: DetailItem[];
  
  /**
   * Text for the action link
   */
  linkText: string;
  
  /**
   * Callback when link is pressed
   */
  onLinkPress: () => void;
  
  /**
   * Image source for the card
   */
  image: ImageSourcePropType;
  
  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}

export function InfoCard({
  title,
  pillLabel,
  details,
  linkText,
  onLinkPress,
  image,
  style,
}: InfoCardProps) {
  return (
    <View style={[styles.card, style]}>
      {/* Content section */}
      <View style={styles.content}>
        {/* Header with title and pill */}
        <View style={styles.header}>
          <ThemedText variant="body1" style={styles.title}>
            {title}
          </ThemedText>
          {pillLabel && (
            <StaticPill
              text={pillLabel}
              size="small"
              color={Theme.colors.neutral[100]}
              textColor={Theme.semantic.text.primary}
            />
          )}
        </View>
        
        {/* Details section */}
        <View style={styles.detailsContainer}>
          {details.map((detail, index) => (
            <View key={index} style={styles.detailRow}>
              <ThemedText variant="body3" style={styles.detailText}>
                {detail.label} {detail.value}
              </ThemedText>
            </View>
          ))}
        </View>
        
        {/* Link text */}
        <Pressable
          onPress={onLinkPress}
          style={({ pressed }) => [
            styles.linkContainer,
            pressed && styles.linkPressed,
          ]}
        >
          <ThemedText variant="button" style={styles.linkText}>
            {linkText}
          </ThemedText>
        </Pressable>
      </View>
      
      {/* Image section */}
      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    // Card shadow matching Figma spec: offset (1, 2), radius 16, spread 1, opacity 0.08
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5, // For Android
  },
  content: {
    flex: 1,
    padding: Theme.spacing.md,
    gap: 12, // Specific gap from Figma design
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  title: {
    color: Theme.semantic.text.primary,
  },
  detailsContainer: {
    gap: Theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailText: {
    color: Theme.semantic.text.secondary,
  },
  linkContainer: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.neutral.white,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  linkText: {
    color: Theme.colors.primary[500],
    textDecorationLine: 'underline',
  },
  linkPressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: 140,
    height: 152,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
