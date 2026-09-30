import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider } from '@/theme';
import { useFonts } from '@/lib/useFonts';
import { Colors } from '@/theme/tokens';
import { DbProvider } from '@/db/DbProvider';
import { useSession } from '@/store/session';

// SplashScreen'i manuel yöneteceğiz
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const { fontsLoaded, fontError } = useFonts();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider variant="playful">
            {/* DbProvider başarılı olana kadar loading gösterir, sonra children */}
            <DbProvider>
              <RootLayoutNav />
            </DbProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isInitialized, isSetupDone, isUnlocked, init, checkAutoLock, recordBackground } = useSession();
  const [appState, setAppState] = useState(AppState.currentState);

  // Uygulama yüklenince init et
  useEffect(() => {
    init();
  }, [init]);

  // AppState (otomatik kilit)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        // Arka plana atıldı
        recordBackground();
      } else if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Geri gelindi
        checkAutoLock();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, checkAutoLock, recordBackground]);

  // Yönlendirme (Routing Guard)
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSetupDone) {
      // Kurulum bitmediyse
      if (segments.join('/') !== '(auth)/setup') {
        router.replace('/(auth)/setup');
      }
    } else if (!isUnlocked) {
      // Kilitliyse
      if (segments.join('/') !== '(auth)/unlock') {
        router.replace('/(auth)/unlock');
      }
    } else {
      // Kurulum bitmiş ve kilitsiz
      if (inAuthGroup || !segments.length) {
        router.replace('/(tabs)');
      }
    }
  }, [isInitialized, isSetupDone, isUnlocked, segments, router]);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/setup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)/unlock" options={{ gestureEnabled: false }} />
        {/* Group screens */}
        <Stack.Screen name="group/form" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="group/[id]" options={{ animation: 'slide_from_right' }} />
        {/* Student screens */}
        <Stack.Screen name="student/form" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="student/bulk" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="student/[id]" options={{ animation: 'slide_from_right' }} />
        {/* Dev screens */}
        <Stack.Screen name="__dev/components" options={{ presentation: 'modal' }} />
        <Stack.Screen name="__dev/db" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
