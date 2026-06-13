import { Stack } from 'expo-router';

export default function SetterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="setting-schedule" options={{ title: 'Setting Schedule' }} />
      <Stack.Screen name="setting-history" options={{ title: 'Setting History' }} />
      <Stack.Screen name="log-routes" options={{ title: 'Log Routes' }} />
      <Stack.Screen name="log-route-form" options={{ title: 'Route Info' }} />
    </Stack>
  );
}
