import { BottomNavBar } from "@/components";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Theme } from "@/constants";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';
import {
  Rubik_300Light,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
} from '@expo-google-fonts/rubik';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Suppress the LogBox overlay for handled API/network errors.
// These are caught and shown to users as friendly messages — the raw
// error detail is only useful in the terminal, not the on-screen overlay.
LogBox.ignoreLogs([
  'AxiosError',
  'Network request failed',
  'Request failed with status code',
]);

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore when splash is already handled by native/runtime.
});

function ConditionalNavBar(props: BottomTabBarProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <BottomNavBar {...props} />;
}

function AppContent() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Tabs
        tabBar={(props) => <ConditionalNavBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="(routes)"
          options={{
            title: "Routes",
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Leaderboard",
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: "Profile",
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('(profile)', { screen: 'index' });
            },
          })}
        />
      </Tabs>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Rubik-Light': Rubik_300Light,
    'Rubik-Regular': Rubik_400Regular,
    'Rubik-Medium': Rubik_500Medium,
    'Rubik-SemiBold': Rubik_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Ignore when no native splash is registered.
      }
    };

    void hideSplash();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
  },
});
