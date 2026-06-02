import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="saved-climbs" options={{ title: 'Saved Climbs' }} />
      <Stack.Screen name="route-detail" options={{ title: 'Route Detail' }} />
    </Stack>
  );
}
