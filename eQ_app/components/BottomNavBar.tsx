import { Theme } from '@/constants';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    EventsSelectedIcon,
    EventsUnselectedIcon,
    LeaderboardSelectedIcon,
    LeaderboardUnselectedIcon,
    ProfileSelectedIcon,
    ProfileUnselectedIcon,
    RoutesSelectedIcon,
    RoutesUnselectedIcon,
} from './icons';

interface TabConfig {
  name: string;
  label: string;
  SelectedIcon: React.ComponentType<{ size?: number; color?: string }>;
  UnselectedIcon: React.ComponentType<{ size?: number; color?: string }>;
}

const tabConfigs: Record<string, TabConfig> = {
  routes: {
    name: 'routes',
    label: 'Routes',
    SelectedIcon: RoutesSelectedIcon,
    UnselectedIcon: RoutesUnselectedIcon,
  },
  leaderboard: {
    name: 'leaderboard',
    label: 'Leaderboard',
    SelectedIcon: LeaderboardSelectedIcon,
    UnselectedIcon: LeaderboardUnselectedIcon,
  },
  events: {
    name: 'events',
    label: 'Events',
    SelectedIcon: EventsSelectedIcon,
    UnselectedIcon: EventsUnselectedIcon,
  },
  profile: {
    name: 'profile',
    label: 'Profile',
    SelectedIcon: ProfileSelectedIcon,
    UnselectedIcon: ProfileUnselectedIcon,
  },
};

export function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        // Skip routes without tab config (like index)
        const tabConfig = tabConfigs[route.name];
        if (!tabConfig) return null;

        const Icon = isFocused ? tabConfig.SelectedIcon : tabConfig.UnselectedIcon;
        const label = options.title || tabConfig.label;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            <Icon size={40} color={Theme.colors.secondary[500]} />
            <Text
              style={[
                styles.label,
                isFocused && styles.labelActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 8,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Rubik-Light',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.5,
    color: Theme.colors.secondary[500],
    textAlign: 'center',
    marginTop: 4,
  },
  labelActive: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '600',
  },
});
