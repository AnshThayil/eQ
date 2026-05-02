import { BottomNavBar } from "@/components";
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
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function ConditionalNavBar(props: BottomTabBarProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <BottomNavBar {...props} />;
}

function AppContent() {
  return (
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
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
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
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
