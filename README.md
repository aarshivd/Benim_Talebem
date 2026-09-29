# Okuma Yıldızı

Hoca denetiminde talebelerin günlük kitap okumasını ve puanlarını takip eden Android mobil uygulama.

## Teknoloji

- **Framework**: Expo (Managed) + React Native + TypeScript (strict)
- **Navigasyon**: Expo Router
- **Veritabanı**: expo-sqlite + Drizzle ORM
- **State**: TanStack Query + Zustand
- **Form**: react-hook-form + zod
- **Animasyon**: react-native-reanimated
- **Test**: Jest (jest-expo)

## Kurulum

```bash
# Bağımlılıkları kur
npm install

# Android geliştirme için
npx expo start
# Ardından "a" tuşuna basarak Android emülatöründe aç
# veya Expo Go uygulamasıyla QR kodunu tara
```

## Scriptler

| Komut | Açıklama |
|-------|----------|
| `npm start` | Expo geliştirme sunucusunu başlatır |
| `npm run android` | Android emülatöründe açar |
| `npm run typecheck` | TypeScript tip kontrolü (`tsc --noEmit`) |
| `npm run lint` | ESLint kontrolü (`expo lint`) |
| `npm test` | Jest testlerini çalıştırır |
| `npm run format` | Prettier ile kodu formatlar |

## Klasör Yapısı

```
├── app/                    # Expo Router route'ları ve ekranlar
│   ├── _layout.tsx         # Kök layout
│   └── index.tsx           # Ana ekran
│
├── src/
│   ├── db/                 # Veritabanı (schema, client, repositories, seed)
│   │   └── repositories/
│   ├── domain/             # Saf iş mantığı fonksiyonları (test edilmiş)
│   ├── features/           # Özellik bazlı hook'lar ve ekran parçaları
│   ├── components/
│   │   └── ui/             # Tasarım sistemi bileşenleri
│   ├── theme/              # Renk, boşluk ve yazı tipi token'ları
│   ├── store/              # Zustand store'ları (oturum/UI durumu)
│   ├── lib/                # Yardımcı fonksiyonlar ve araçlar
│   │   └── __tests__/
│   └── i18n/
│       └── tr.ts           # Türkçe metin sabitleri
│
├── drizzle/                # Drizzle migration dosyaları
├── assets/                 # Görseller, fontlar
├── app.json                # Expo yapılandırması
├── babel.config.js         # Babel (alias + reanimated)
├── metro.config.js         # Metro (alias)
├── tsconfig.json           # TypeScript (strict, @/* alias)
└── AGENTS.MD               # Proje kuralları ve mimari belge
```

## Alias

`@/*` → `src/*` (TypeScript, Metro, Jest'te çalışır)

```typescript
import { something } from '@/lib/utils';
// Eşdeğeri: import { something } from 'src/lib/utils';
```

## Geliştirme Notları

- Tek platform: **Android** — iOS'a özel kod/paket eklenmez.
- Geliştirme **Expo Go** ile yapılır.
- Tüm veriler cihazda (SQLite). İnternet/sunucu bağlantısı yoktur.
- PIN yalnızca `expo-secure-store`'da tutulur.
- Metinler Türkçe; `src/i18n/tr.ts` kullanılır, koda gömülmez.
