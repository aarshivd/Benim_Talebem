/**
 * src/db/DbProvider.tsx
 * Migration'ları uygular, seed çalıştırır, hazır olana kadar yükleniyor gösterir.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/db/client';
import { runSeedIfNeeded } from '@/db/seed';
import { Colors, FontFamily, FontSize } from '@/theme/tokens';

// Drizzle migration dosyası — babel inline-import ile yüklenir
// eslint-disable-next-line @typescript-eslint/no-require-imports
const migrations = require('../../drizzle/migrations');

interface DbProviderProps {
  children: React.ReactNode;
}

export function DbProvider({ children }: DbProviderProps) {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = React.useState(false);

  React.useEffect(() => {
    if (!success) return;
    runSeedIfNeeded(db)
      .then(() => setSeeded(true))
      .catch((err: unknown) => {
        console.error('[DbProvider] Seed hatası:', err);
        setSeeded(true); // Seed başarısız olsa da devam et
      });
  }, [success]);

  // ── Hata ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.dangerSoft }]}>
        <View style={styles.errorCard}>
          <React.Fragment>
            {/* Yazı bileşeni burada import edilmiyor — ThemeProvider henüz hazır değil */}
            {/* Sade RN bileşeni kullan */}
          </React.Fragment>
        </View>
      </View>
    );
  }

  // ── Yükleniyor ────────────────────────────────────────────────────────────
  if (!success || !seeded) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    maxWidth: 340,
    width: '90%',
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.ink,
    textAlign: 'center',
  },
});
