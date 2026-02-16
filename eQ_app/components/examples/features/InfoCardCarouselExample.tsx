/**
 * InfoCardCarousel Example
 * 
 * This example demonstrates how to use the InfoCardCarousel component
 * with sample data that matches the Figma design.
 */

import React from 'react';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import { InfoCardCarousel } from '@/components';
import { InfoCardProps } from '@/components/features/InfoCard';

// Example image - using the existing info card example image
const exampleImage: ImageSourcePropType = require('@/assets/images/info-card-example.png');

export function InfoCardCarouselExample() {
  // Sample data for the carousel
  const carouselItems: InfoCardProps[] = [
    {
      title: 'Climbfit',
      pillLabel: 'Paused',
      details: [
        { label: 'Sessions:', value: '4/12' },
        { label: 'Slot:', value: '6:00 PM' },
        { label: 'Location:', value: 'EQ Hoodi' },
      ],
      linkText: 'View Details',
      onLinkPress: () => {
        console.log('View Details pressed for Climbfit');
      },
      image: exampleImage,
    },
    {
      title: 'Boulder Basics',
      pillLabel: 'Active',
      details: [
        { label: 'Sessions:', value: '8/12' },
        { label: 'Slot:', value: '7:00 PM' },
        { label: 'Location:', value: 'EQ Koramangala' },
      ],
      linkText: 'View Details',
      onLinkPress: () => {
        console.log('View Details pressed for Boulder Basics');
      },
      image: exampleImage,
    },
    {
      title: 'Advanced Training',
      pillLabel: 'Upcoming',
      details: [
        { label: 'Sessions:', value: '0/8' },
        { label: 'Slot:', value: '8:00 PM' },
        { label: 'Location:', value: 'EQ Indiranagar' },
      ],
      linkText: 'View Details',
      onLinkPress: () => {
        console.log('View Details pressed for Advanced Training');
      },
      image: exampleImage,
    },
  ];

  return (
    <View style={styles.container}>
      <InfoCardCarousel
        title="Your plans"
        items={carouselItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
});
