import { Button, ThemedText } from '@/components';
import { Theme } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileNavButtonExample } from '@/components/examples';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const { signOut, username } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="heading2" style={styles.message}>
            You are logged in as {username ?? 'Unknown user'}
          </ThemedText>
          <ThemedText variant="body1" style={styles.description}>
            Profile navigation button preview
          </ThemedText>
        </View>

        <ProfileNavButtonExample />

        <Button
          text="Log Out"
          onPress={signOut}
          fullWidth
          accessibilityHint="Signs you out of the app"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  content: {
    gap: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
  },
  header: {
    gap: Theme.spacing.xs,
  },
  message: {
    color: Theme.colors.neutral.black,
  },
  description: {
    color: Theme.semantic.text.secondary,
  },
});
