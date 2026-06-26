import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {

  const colorScheme = useColorScheme();

  //State pour gérer swich entre register et login
  const [hadAccount, setHadAccount] = 'false';

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        
          <Stack.Screen
            name = "index"
            options ={{ headerShown: false }}
          />

          <Stack.Screen
            name = "auth"
            options ={{ headerShown: false }}
          />          

      </Stack>
    </ThemeProvider>
  );
}
