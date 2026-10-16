# Okuma Yıldızı - Manuel Test Planı

Bu belge, uygulamanın yayına alınmadan önce geçmesi gereken tüm elle test (manual test) adımlarını içerir.

## 1. Kurulum ve Güvenlik (PIN / Kilit)

- [ ] Uygulama ilk kez açıldığında PIN oluşturma ekranı geliyor mu?
- [ ] 4 haneli PIN başarıyla oluşturuluyor ve onaylanıyor mu?
- [ ] PIN yanlış girildiğinde hata verip tekrar deneme istiyor mu?
- [ ] Uygulama arka plana atılıp geri dönüldüğünde (veya kapatılıp açıldığında) PIN soruyor mu?
- [ ] Pano modundayken uygulama arka plana atılıp dönüldüğünde otomatik kilit **devre dışı** mı?
- [ ] Ayarlardan PIN değiştirme işlemi başarılı mı?

## 2. Gruplar ve Talebeler (CRUD & Toplu İşlemler)

- [ ] Yeni grup ekleniyor mu (Ad, Seviye, Renk, Emoji)?
- [ ] Grup düzenleme (isim/renk/emoji değişikliği) çalışıyor mu?
- [ ] İçinde talebe olan grup silinmeye çalışıldığında uygun uyarı çıkıyor mu?
- [ ] Gruba tekil talebe başarıyla ekleniyor mu?
- [ ] Gruba **toplu talebe ekleme** ekranı düzgün çalışıyor mu (virgül veya yeni satır ile ayırma)?
- [ ] Talebe profili düzenlenebiliyor mu?
- [ ] Talebe başka bir gruba taşınabiliyor mu?
- [ ] Talebe silindiğinde (soft delete) listeden kayboluyor mu?

## 3. Kitap Yönetimi ve Atama

- [ ] Yeni kitap eklenebiliyor mu (Ad, Yazar, Toplam Sayfa)?
- [ ] Talebeye kitap atanabiliyor mu?
- [ ] Aynı kitap aynı talebeye iki kez atanmaya çalışıldığında engelleniyor mu?
- [ ] Kitap atama esnasında "Şu an kaçıncı sayfada" değeri doğru alınıyor mu?
- [ ] Okuyanı olan bir kitap silinmeye çalışıldığında silinmesi engelleniyor mu?

## 4. Okuma Girişi (Tekil, Toplu ve Sınır Durumlar)

- [ ] Talebeye günlük okuma girildiğinde (ör: 10 sayfa) puanı (pages_per_point'e göre) anında hesaplanıp güncelleniyor mu?
- [ ] Günlük hedef (daily_goal_pages) aşıldığında bonus puan (daily_goal_bonus) doğru şekilde yansıtılıyor mu?
- [ ] Aynı güne ait son okuma kaydı silindiğinde (veya geri alındığında) puan eski haline dönüyor mu?
- [ ] Kitabın toplam sayfasından fazla sayfa girilmesi engelleniyor mu veya sınırda bırakılıyor mu?
- [ ] "Gruplar" sekmesinde veya "Bugün" sekmesinde "Toplu Okuma Girişi" yapılabiliyor mu? Toplu girilen okuma tüm seçili talebelerin puanlarına yansıyor mu?

## 5. Puan Sistemi (Manuel Puan & Geri Alma)

- [ ] "Bugün" ekranından seçili talebeye "Serbest Puan" verilebiliyor mu?
- [ ] "Ayarlar > Puan Kuralları"ndan yeni kural eklenebiliyor mu?
- [ ] "Puan Ver" ekranında kurallar liste halinde çıkıyor ve seçilerek hızlı puan verilebiliyor mu?
- [ ] Eksi puan verme ayarı (allow_negative_points) kapalıyken eksi puan engelleniyor mu, açıkken verilebiliyor mu?
- [ ] Talebe profilindeki "Puan Geçmişi" kısmından son verilen manuel puan "Geri Al" (Undo) ile iptal edilebiliyor mu?

## 6. Sıralama ve Podyum (Eşit Puan & Dönem)

- [ ] "Sıralama" sekmesinde günlük ve dönemlik sıralama geçişi düzgün çalışıyor mu?
- [ ] Eşit puana sahip talebeler aynı sıra numarasını (ör: 1, 1, 3) alıyor mu?
- [ ] Sıralamada podyum animasyonu doğru görüntüleniyor mu?
- [ ] Filtreleme (belirli bir grup seçildiğinde) sadece o grubun öğrencileri sıralanıyor mu?

## 7. Dönem Yönetimi ve Çakışma

- [ ] Yeni dönem oluşturulabiliyor mu (Başlangıç ve Bitiş tarihi)?
- [ ] Yeni oluşturulan dönem mevcut dönemin tarihleriyle çakışıyorsa sistem uyarı veriyor/engelliyor mu?
- [ ] Geçmiş bir döneme ait sıralama geçmişi görüntülenebiliyor mu?

## 8. Ödüller

- [ ] Yeni bir ödül (Puan Hedefi veya İlk N Sıra) eklenebiliyor mu?
- [ ] Ödül oluşturulurken "Şu an kaç talebe kazanmış?" önizlemesi (evaluateRewards) doğru çalışıyor mu?
- [ ] Talebe ödül şartını sağladığında profilinde ödül rozeti görünüyor mu?

## 9. Pano Modu

- [ ] Pano moduna girildiğinde cihaz uykuya geçmesi engelleniyor mu (expo-keep-awake çalışıyor mu)?
- [ ] Otomatik dönüş aktifken (10 sn) günlük ve dönemlik ekranlar arasında otomatik geçiş yapıyor mu?
- [ ] Ekrana uzun basıldığında Pano Modu'ndan çıkılıyor mu?

## 10. Yedekleme ve Geri Yükleme

- [ ] "Ayarlar > Yedek" ekranından yedek dosyası (JSON) oluşturulup paylaşılabiliyor mu?
- [ ] Uygulamadaki tüm veriler (Talebeler, Gruplar vb.) silinip, alınan yedek geri yüklendiğinde her şey eksiksiz dönüyor mu?
- [ ] Uygun olmayan / hatalı bir JSON dosyası geri yüklenmeye çalışıldığında hata mesajı verip işlemi reddediyor mu?

## 11. Cihaz / İşletim Sistemi Uyum Testleri

- [ ] Uygulamayı tamamen kapatıp (Force Close) açınca son durum (puanlar vb.) korunuyor mu?
- [ ] Sistem yazı boyutu büyütüldüğünde ekranlarda taşma, bozulma oluyor mu? (1.3x - 1.5x test)
- [ ] Android'de "Geri" tuşuna basıldığında modallardan (ör: Talebe Ekle Modalı) düzgün çıkılıyor mu?
- [ ] İnternet tamamen kapalıyken (Uçak Modu) uygulamanın tüm fonksiyonları çalışıyor mu?
