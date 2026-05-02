import { Theme } from '@/constants/Theme';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ThemedText } from '../../basic/ThemedText';
import { ProfileNavButton } from '../../features/ProfileNavButton';
import { HoldIcon, SaveIcon } from '../../icons';

export function ProfileNavButtonExample() {
  return (
    <View style={styles.container}>
      <ThemedText variant="body2" style={styles.title}>
        ProfileNavButton Example
      </ThemedText>

      <View style={styles.row}>
        <ProfileNavButton
          text="Saved climbs"
          icon={<SaveIcon />}
          onPress={() => Alert.alert('Pressed', 'Saved climbs tapped')}
        />

        <ProfileNavButton
          text="My ascents"
          icon={<HoldIcon size={24} color={Theme.colors.primary[500]} />}
          onPress={() => Alert.alert('Pressed', 'My ascents tapped')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.md,
  },
  title: {
    color: Theme.semantic.text.primary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
});