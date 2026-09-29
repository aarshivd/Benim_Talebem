/**
 * src/lib/useFonts.ts
 * Nunito fontlarını yükler, yüklenene kadar splash ekranını açık tutar.
 */

import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts as useExpoFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

// Splash'ı fontlar yüklenene kadar göster
SplashScreen.preventAutoHideAsync();

export function useFonts(): { fontsLoaded: boolean; fontError: Error | null } {
  const [fontsLoaded, fontError] = useExpoFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return { fontsLoaded, fontError };
}
