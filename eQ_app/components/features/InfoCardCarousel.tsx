/**
 * InfoCardCarousel component - A horizontal carousel for InfoCards
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=376-1401
 * 
 * A carousel component that displays:
 * - Optional title section
 * - Horizontally scrollable InfoCard items
 * - Pagination dots indicator
 */

import { Theme } from '@/constants/Theme';
import React, { useRef, useState } from 'react';
import { StyleSheet, View, FlatList, NativeSyntheticEvent, NativeScrollEvent, ViewStyle, Dimensions } from 'react-native';
import { ThemedText } from '../basic/ThemedText';
import { InfoCard, InfoCardProps } from './InfoCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (Theme.spacing.lg * 2); // Full width minus horizontal padding
const CARD_SPACING = Theme.spacing.md;

export interface InfoCardCarouselProps {
  /**
   * Optional title text above the carousel (e.g., "Your plans")
   */
  title?: string;
  
  /**
   * Array of InfoCard data items
   */
  items: InfoCardProps[];
  
  /**
   * Additional style overrides for the container
   */
  style?: ViewStyle;
}

export function InfoCardCarousel({
  title,
  items,
  style,
}: InfoCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: InfoCardProps }) => (
    <View style={styles.cardWrapper}>
      <InfoCard {...item} />
    </View>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: CARD_WIDTH + CARD_SPACING,
    offset: (CARD_WIDTH + CARD_SPACING) * index,
    index,
  });

  return (
    <View style={[styles.container, style]}>
      {/* Title section */}
      {title && (
        <ThemedText variant="body2" style={styles.title}>
          {title}
        </ThemedText>
      )}

      {/* Card carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={items}
          renderItem={renderItem}
          keyExtractor={(_, index) => `info-card-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.flatListContent}
        />

        {/* Pagination dots */}
        {items.length > 1 && (
          <View style={styles.paginationContainer}>
            {items.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    color: Theme.semantic.text.primary,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  carouselContainer: {
    gap: Theme.spacing.md,
  },
  flatListContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 4, // Add vertical padding to prevent shadow clipping
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    paddingVertical: 4, // Add padding to prevent shadow clipping
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
    backgroundColor: 'transparent',
  },
  paginationDotActive: {
    backgroundColor: Theme.colors.primary[500],
    borderWidth: 0,
  },
});
