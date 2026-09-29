# AGENTS.md — Okuma Yıldızı

## Proje
Hoca denetiminde talebelerin (ilkokul–üniversite) günlük kitap okumasını (hangi kitap, kaçıncı sayfa, bugün kaç sayfa) ve puanlarını (soru cevabı, uslu durma, ek görev) tutan; günlük ve dönemlik ödül sıralaması çıkaran ANDROID mobil uygulama.
Kullanıcı yalnızca hoca (PIN'li). Talebeler giriş yapmaz, sadece profildir; "Pano Modu"nda sıralamayı görürler.
Tüm veri cihazda (SQLite). İnternet/sunucu yok. Mağazaya çıkmadan APK ile dağıtılır. Backend sonraki faz.

## Teknoloji
Expo (güncel SDK, managed) + React Native + TypeScript (strict) · Expo Router · expo-sqlite + Drizzle ORM · TanStack Query (okuma/yazma + invalidate) · Zustand (oturum/UI durumu) · react-hook-form + zod · Reanimated · date-fns (tr) · expo-crypto (UUID, hash) · expo-secure-store (PIN) · expo-file-system + expo-sharing + expo-document-picker (yedek) · Jest (jest-expo).
Tek platform: Android. iOS'a özel kod/paket ekleme.
Expo paketlerini her zaman `npx expo install` ile kur. Kurulu SDK'nın güncel dokümanını esas al, eski/kaldırılmış API kullanma.
Geliştirme Expo Go ile yapılır: Expo Go'da çalışmayan native paket ekleme.

## Klasör yapısı
app/ (yalnızca route/ekran, iş mantığı yok) · src/db (schema, client, repositories, seed) · src/domain (saf fonksiyonlar, testli) · src/features/<özellik> (hook'lar, ekran parçaları) · src/components/ui (tasarım sistemi) · src/theme · src/store · src/lib · src/i18n/tr.ts · drizzle/ (üretilen migration) · alias: @/* → src/*

## Mimari kurallar
1. Ekran → hook (TanStack Query) → repository → Drizzle. Ekran DB'ye doğrudan erişmez.
2. İş kuralları (okuma/puan/sıralama/ödül/dönem hesapları) src/domain'de saf fonksiyondur; UI ve DB'den bağımsız, Jest testli.
3. Her tablo: id (UUID, text), created_at, updated_at (ISO string), deleted_at (soft delete). Silme = deleted_at set. Tüm sorgular deleted_at IS NULL filtreler. (İleride senkron için.)
4. Gün alanları yerel gün 'YYYY-MM-DD' (text); zaman damgaları ISO string.
5. Birden çok tabloya yazan işlemler transaction içinde.
6. Metinler Türkçe ve src/i18n/tr.ts'te; koda gömme.
7. Sabit renk/boşluk yok: theme token'ları.
8. TypeScript strict, `any` yok. ESLint + Prettier temiz.
9. Yeni bağımlılık eklemeden önce gerekçeni yaz.
10. PIN yalnızca expo-secure-store'da tutulur, DB'ye ve yedeğe girmez.

## Alan kuralları
- Okuma: student_books.current_page = son okunan sayfa. Okuma kaydı: from_page = kayıt anındaki current_page, to_page = bugün ulaşılan son sayfa, pages_read = to_page − from_page. to_page > from_page ve ≤ kitabın toplam sayfası. Bir talebe-kitabın yalnızca SON kaydı düzenlenir/silinir. Kayıttan sonra current_page = son kaydın to_page'i; ≥ toplam sayfa ise durum 'finished'.
- Okuma puanı: talebe + gün başına TEK 'reading' kaynaklı point_event = floor(günlük toplam sayfa / pages_per_point) + (günlük toplam ≥ daily_goal_pages ve daily_goal_pages > 0 ise daily_goal_bonus). Log ekle/düzenle/sil sonrası o günü yeniden hesapla; sonuç 0 ise olayı soft-delete et.
- Manuel puan: point_events (source='manual'); kuraldan veya serbest puan + başlık. Eksi puan yalnızca allow_negative_points açıksa.
- Günlük sıralama = seçili günün point_events toplamı. Dönemlik = dönem [start_date, end_date] toplamı.
- Sıra: puan azalan → okunan sayfa azalan → ad (tr). Sıra numarası yalnızca puana göre: eşit puan = aynı sıra, sonraki atlanır (1,2,2,4). 0 puan sırasızdır ("—") ve listede altta durur.
- Dönem: aynı anda tek aktif dönem; tarih aralıkları çakışamaz; yeni dönem eski veriyi silmez.
- Ödül: kind='points' → toplam ≥ target_points; kind='rank' → sıra ≤ rank_top ve puan > 0; scope 'daily' | 'term'.
- Varsayılan ayarlar: pages_per_point=10, daily_goal_pages=20, daily_goal_bonus=5, allow_negative_points=false, auto_lock_seconds=60.
- Varsayılan puan kuralları: Soruya doğru cevap +5, Uslu durdu +3, Derse hazırlıklı +2, Ek görev +10.

## Tasarım
Ortaokul talebelerine hitap eden canlı, şık, yuvarlak hatlı, büyük dokunma alanlı (≥48dp) tasarım. Yazı tipi Nunito (Türkçe karakter destekli). Emoji avatarlar, konfeti, podyum. Lise/üniversite gruplarında daha sade varyant. Yalnızca açık tema.

## Çalışma şekli
- Yalnızca istenen aşamayı yap; kapsam dışı özellik ekleme.
- Bitirince `npm run typecheck`, `npm run lint`, `npm test` çalıştır ve hataları düzelt.
- Sonda: yaptıklarını, elle test adımlarını ve varsayımlarını kısaca raporla.
- Kritik olmayan belirsizlikte soru sorma; makul varsayım yap ve raporda belirt.