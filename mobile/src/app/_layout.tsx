import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
  usePathname,
} from "expo-router";

import { useFonts } from "expo-font";
import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";

import { useColorScheme } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AvisModal from "@/components/AvisModal";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const pagesSansAvis =
    pathname === "/auth" ||
    pathname === "/Parametres" ||
    pathname === "/parametres" ||
    pathname === "/";

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="auth"
          options={{ headerShown: false }}
        />
      </Stack>

      {!pagesSansAvis && <AvisModal />}
    </ThemeProvider>
  );
}