import { Stack } from 'expo-router';

export default function RoutesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Routes',
        }}
      />
      <Stack.Screen
        name="route-detail"
        options={{
          title: 'Route Detail',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack>
  );
}
