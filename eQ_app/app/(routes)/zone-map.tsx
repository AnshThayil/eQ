/**
 * Zone Map Screen - Displays a static map of climbing zones
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=49-484
 */

import { CloseIcon } from '@/components/icons';
import { StaticPill } from '@/components/StaticPill';
import { ThemedText } from '@/components/ThemedText';
import { Theme } from '@/constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, ViewStyle, TextStyle, ImageStyle } from 'react-native';

export default function ZoneMapScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.neutral.white} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="heading1" style={styles.title}>
            Zone Map
          </ThemedText>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityLabel="Close map"
            accessibilityHint="Returns to routes screen"
          >
            <CloseIcon size={24} color={Theme.colors.neutral.black} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Pills Section */}
          <View style={styles.infoSection}>
            <ThemedText variant="body2" style={styles.infoLabel}>
              Newest Set:
            </ThemedText>
            <StaticPill 
              text="Z1" 
              size="large"
              shape="circle"
              color={Theme.colors.primary[500]}
              textColor={Theme.colors.neutral.white}
            />
            <StaticPill 
              text="Z7" 
              size="large"
              shape="circle"
              color={Theme.colors.primary[500]}
              textColor={Theme.colors.neutral.white}
            />
            <ThemedText variant="body2" style={styles.infoLabel}>
              Up Next:
            </ThemedText>
            <StaticPill 
              text="Z2" 
              size="large"
              shape="circle"
              color={Theme.colors.secondary[500]}
              textColor={Theme.colors.neutral.white}
            />
            <StaticPill 
              text="Z4" 
              size="large"
              shape="circle"
              color={Theme.colors.secondary[500]}
              textColor={Theme.colors.neutral.white}
            />
          </View>

          {/* Map Image */}
          <View style={styles.mapContainer}>
            <Image
              source={require('@/assets/images/zone-map.png')}
              style={styles.mapImage}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create<{
  outerContainer: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  infoSection: ViewStyle;
  infoLabel: TextStyle;
  mapContainer: ViewStyle;
  mapImage: ImageStyle;
}>({
  outerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.neutral.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    color: Theme.colors.neutral[900],
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoLabel: {
    color: Theme.colors.neutral.black,
  },
  mapContainer: {
    width: '90%',
    maxWidth: 300,
    aspectRatio: 323 / 612,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
});
