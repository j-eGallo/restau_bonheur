import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { useState } from 'react';
import { useFonts } from "expo-font";
import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { useColorScheme } from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {

  const colorScheme = useColorScheme();

    const [fontsLoaded] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    });

    if (!fontsLoaded) {
      return null;
    }


  //State pour gérer swich entre register et login
  const [hadAccount, setHadAccount] = 'false';

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        
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
