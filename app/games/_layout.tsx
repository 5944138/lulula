import { Stack } from 'expo-router';

import { MircColors } from '@/constants/theme';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: MircColors.desktopDark },
        animation: 'slide_from_right',
      }}
    />
  );
}
