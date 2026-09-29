import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/theme';
import { useFonts } from '@/lib/useFonts';
import { Colors } from '@/theme/tokens';
import { DbProvider } from '@/db/DbProvider';

export default function RootLayout() {
  const { fontsLoaded, fontError } = useFonts();

  // Fontlar yüklenene kadar boş görünüm göster (splash açık)
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DbProvider>
        <ThemeProvider variant="playful">
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="dark" />
        </ThemeProvider>
      </DbProvider>
    </GestureHandlerRootView>
  );
}
