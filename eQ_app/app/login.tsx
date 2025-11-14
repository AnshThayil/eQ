import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import { Colors } from '@/constants';
import { login } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const { access, refresh } = await login(username, password);
      await signIn(access, refresh);
      router.replace('/routes');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.detail || 'Invalid username or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText variant="heading1" style={styles.title}>
          Welcome to eQ
        </ThemedText>
        <ThemedText variant="body2" style={styles.subtitle}>
          Sign in to track your climbing progress
        </ThemedText>

        <View style={styles.form}>
          <InputField
            type="text"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            disabled={loading}
            fullWidth
          />
          
          <InputField
            type="text"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            disabled={loading}
            fullWidth
          />

          <Button
            text={loading ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            disabled={loading}
            fullWidth
            style={styles.button}
          />

          {loading && (
            <ActivityIndicator
              size="small"
              color={Colors.primary[500]}
              style={styles.loader}
            />
          )}
        </View>

        <ThemedText variant="body3" style={styles.hint}>
          Test credentials: admin / admin123
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    color: Colors.primary[500],
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.neutral[700],
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
  loader: {
    marginTop: 8,
  },
  hint: {
    color: Colors.neutral[500],
    marginTop: 24,
    textAlign: 'center',
  },
});
