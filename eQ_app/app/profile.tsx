import { Theme } from '@/constants';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/services/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { signOut, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadUsername();
    }
  }, [isAuthenticated, authLoading]);

  const loadUsername = async () => {
    try {
      const profile = await getUserProfile();
      setUsername(profile.username);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      // If it's an authentication error, redirect to login
      if (error.message?.includes('refresh token') || error.response?.status === 401) {
        await signOut();
        router.replace('/login');
      } else {
        setUsername('Unknown');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.authText}>
          Please log in to view your profile
        </Text>
        <Button 
          text="Go to Login" 
          onPress={() => router.push('/login')}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText variant="heading2" style={styles.text}>
        You are logged in as {username}
      </ThemedText>
      <Button 
        text="Logout" 
        onPress={handleLogout}
        variant="primary"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral.white,
    padding: Theme.spacing.lg,
  },
  text: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  authText: {
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    fontSize: 18,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
  },
  button: {
    marginTop: Theme.spacing.md,
  },
});
