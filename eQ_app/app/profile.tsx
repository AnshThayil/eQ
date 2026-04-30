import { Button, ThemedText } from '@/components';
import { Theme } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const { signOut, username } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText variant="heading2" style={styles.message}>
          You are logged in as {username ?? 'Unknown user'}
        </ThemedText>

        <Button
          text="Log Out"
          onPress={signOut}
          fullWidth
          accessibilityHint="Signs you out of the app"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  message: {
    color: Theme.colors.neutral.black,
    textAlign: 'center',
  },
});
