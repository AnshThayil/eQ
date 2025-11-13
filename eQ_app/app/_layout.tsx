import {
    Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';
import {
    Rubik_300Light,
    Rubik_500Medium,
} from '@expo-google-fonts/rubik';
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Rubik-Light': Rubik_300Light,
    'Rubik-Medium': Rubik_500Medium,
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

  return <Stack />;
}
