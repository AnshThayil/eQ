/**
 * DrillScheduleCard component - Displays the upcoming drill schedule on the Routes screen
 * Based on Figma design: https://www.figma.com/design/7PMr5fujBVexahIxwYsSyS/EQ?node-id=463-3242
 */

import { Theme } from '@/constants';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ThemedText } from '../basic/ThemedText';

export interface DrillScheduleCardProps {
  lastSetDate: string;
  lastSetZones: string;
  upNextDate: string;
  upNextZones: string;
  onPress?: () => void;
}

function DrillIcon() {
  return (
    <Svg width={41} height={40} viewBox="0 0 41 40" fill="none">
      <Path d="M5.74008 0.0257151C6.86416 -0.0265313 8.29281 0.0168948 9.44277 0.017569L16.5297 0.0209961L21.7024 0.0163328C22.7562 0.0153216 23.8331 -0.00816063 24.8842 0.0644788C25.2153 0.0873436 25.4072 0.197847 25.704 0.349642C25.9179 0.997835 25.8483 2.73663 25.848 3.47156L25.8435 8.05279L25.8494 12.5219C25.8518 13.3429 25.8663 14.1593 25.837 14.9832C25.8019 15.9679 25.3606 16.1701 24.5412 16.2527C23.7376 16.3335 22.9031 16.2974 22.0956 16.2969L17.8035 16.2914C17.0091 16.2902 15.9667 16.2614 15.1945 16.326C15.166 17.6911 15.3792 18.2767 15.8725 19.5364C15.5299 20.6163 14.9853 20.75 14.0604 20.9774L14.0581 21.8125L14.0601 29.1006C11.5034 29.0932 8.68633 29.1676 6.15789 29.0782C6.09553 25.9302 6.16747 22.761 6.1399 19.6112C6.13037 18.5225 6.13503 17.4161 6.16224 16.3286C4.47914 16.2348 2.9988 15.8093 1.73258 14.5579C-0.274964 12.5737 0.12224 10.2277 0.0148944 7.66875C-0.172128 3.2119 1.38344 0.224926 5.74008 0.0257151Z" fill="#332F74" />
      <Path d="M8.47224 4.60727C8.53983 4.60115 8.60757 4.59851 8.67541 4.59924C9.69045 4.60548 9.77653 5.30243 9.74497 6.19236C9.22679 7.0028 6.52291 9.98787 5.75811 10.2743C4.49717 10.4416 4.48554 9.89675 4.45941 8.73165C5.46154 7.78869 7.57397 5.14075 8.47224 4.60727Z" fill="#D6D5E3" />
      <Path d="M13.8003 4.5575C14.7219 4.6298 14.8645 5.14153 14.9587 6.03646C14.4778 6.87864 11.5881 10.038 10.807 10.3666C9.40915 10.0989 9.34736 8.87985 10.255 8.03239C11.0649 7.27611 12.8762 4.78457 13.8003 4.5575Z" fill="#D6D5E3" />
      <Path d="M4.89868 30.2481C5.18136 30.1968 6.48089 30.2201 6.8555 30.2206L11.0269 30.2257L17.7237 30.2213C18.4968 30.2209 20.4709 30.1703 21.1193 30.2828C21.4787 30.6337 21.8987 30.9974 21.9081 31.5665C21.952 33.6778 21.9012 35.8 21.9233 37.9116C21.9365 39.1648 21.53 39.8998 20.3021 39.9808L9.86271 39.9744L6.63092 39.9801C5.87473 39.9815 4.50952 40.1084 3.88527 39.7034C3.03476 39.1516 3.20513 37.5726 3.2225 36.6432C3.25288 35.0163 3.14144 33.3665 3.25616 31.7484C3.34112 30.5497 3.96116 30.3524 4.89868 30.2481Z" fill="#332F74" />
      <Path d="M26.9508 1.1925C30.0464 2.11322 31.3222 3.5073 32.2196 6.90663C34.7949 6.96652 37.3962 6.81225 39.9636 6.97854C40.4579 7.01826 41.0058 7.51005 40.9999 8.07667C40.9855 9.46064 39.188 9.22587 38.3244 9.22379L35.6048 9.21458C34.4948 9.21924 33.3847 9.21649 32.2747 9.20637C32.0508 9.81682 31.9471 10.4341 31.653 11.0689C30.4173 13.7359 29.2822 14.1741 26.9397 15.0776C27.0138 13.4505 26.9534 11.2782 26.9506 9.61384L26.9508 1.1925Z" fill="#332F74" />
    </Svg>
  );
}

function CaretRightIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={Theme.colors.neutral[900]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DrillScheduleCard({
  lastSetDate,
  lastSetZones,
  upNextDate,
  upNextZones,
  onPress,
}: DrillScheduleCardProps) {
  return (
    <TouchableOpacity
      style={styles.shadow}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Drill schedule"
    >
      <View style={styles.card}>
        {/* Left thumbnail */}
        <View style={styles.thumbnail}>
          <DrillIcon />
        </View>

        {/* Last set info */}
        <View style={styles.infoBlock}>
          <ThemedText variant="subtext2">Last set:</ThemedText>
          <View style={styles.infoDetails}>
            <ThemedText variant="subtext1">Date: {lastSetDate}</ThemedText>
            <ThemedText variant="subtext1">Zones: {lastSetZones}</ThemedText>
          </View>
        </View>

        {/* Up next info */}
        <View style={styles.infoBlock}>
          <ThemedText variant="subtext2">Up Next:</ThemedText>
          <View style={styles.infoDetails}>
            <ThemedText variant="subtext1">Date: {upNextDate}</ThemedText>
            <ThemedText variant="subtext1">Zones: {upNextZones}</ThemedText>
          </View>
        </View>

        {/* Caret */}
        <CaretRightIcon />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: 8,
    height: 82,
    overflow: 'hidden',
    paddingRight: 16,
  },
  thumbnail: {
    width: 65,
    height: 82,
    backgroundColor: Theme.colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBlock: {
    gap: 4,
    flex: 1,
    paddingLeft: 16,
  },
  infoDetails: {
    gap: 0,
  },
});
