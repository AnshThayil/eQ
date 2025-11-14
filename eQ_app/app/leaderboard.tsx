import { Theme } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';

export default function LeaderboardScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && !isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.authText}>Please log in to view leaderboard</Text>
        <Button 
          text="Go to Login" 
          onPress={() => router.push('/login')}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Leaderboard Screen</Text>
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
    gap: Theme.spacing.lg,
  },
  text: {
    fontFamily: 'Rubik-Medium',
    fontSize: 24,
    color: Theme.colors.secondary[500],
  },
  authText: {
    fontSize: 18,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
    textAlign: 'center',
  },
  button: {
    marginTop: Theme.spacing.md,
  },
});
