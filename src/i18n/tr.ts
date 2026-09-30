/**
 * src/i18n/tr.ts
 * Uygulama içi Türkçe metinler.
 * Koda doğrudan metin gömmek yasaktır; bu dosyadan kullanılır.
 * Test: ğ ü ş ı İ ö ç Ğ Ü Ş Ö Ç
 */
const tr = {
  app: {
    name: 'Okuma Yıldızı',
    welcome: 'Hoş Geldiniz',
    loading: 'Yükleniyor…',
  },

  // ── Ortak eylem düğmeleri ────────────────────────────────────────────────
  common: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    undo: 'Geri Al',
    ok: 'Tamam',
    confirm: 'Onayla',
    close: 'Kapat',
    back: 'Geri',
    add: 'Ekle',
    edit: 'Düzenle',
    done: 'Bitti',
    next: 'İleri',
    prev: 'Önceki',
    search: 'Ara',
    clear: 'Temizle',
    select: 'Seç',
    selectAll: 'Tümünü Seç',
    deselect: 'Seçimi Kaldır',
    retry: 'Tekrar Dene',
    refresh: 'Yenile',
    share: 'Paylaş',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    yes: 'Evet',
    no: 'Hayır',
    error: 'Hata',
    success: 'Başarılı',
    warning: 'Uyarı',
    info: 'Bilgi',
    optional: 'İsteğe bağlı',
    required: 'Zorunlu',
    noData: 'Henüz veri yok',
    loading: 'Yükleniyor…',
    saving: 'Kaydediliyor…',
    deleting: 'Siliniyor…',
    points: 'puan',
    pages: 'sayfa',
    rank: 'sıra',
  },

  // ── Silme onay diyaloğu ──────────────────────────────────────────────────
  deleteDialog: {
    title: 'Silmek istediğinize emin misiniz?',
    message: 'Bu işlem geri alınamaz.',
    confirm: 'Evet, Sil',
    cancel: 'İptal',
  },

  // ── Form doğrulama mesajları ─────────────────────────────────────────────
  validation: {
    required: 'Bu alan zorunludur.',
    minLength: (n: number) => `En az ${n} karakter giriniz.`,
    maxLength: (n: number) => `En fazla ${n} karakter giriniz.`,
    min: (n: number) => `En az ${n} olmalıdır.`,
    max: (n: number) => `En fazla ${n} olmalıdır.`,
    invalidEmail: 'Geçerli bir e-posta adresi giriniz.',
    invalidNumber: 'Geçerli bir sayı giriniz.',
    positiveNumber: 'Sıfırdan büyük bir sayı giriniz.',
  },

  // ── Boş durum mesajları ──────────────────────────────────────────────────
  empty: {
    students: 'Henüz talebe eklenmedi.',
    books: 'Henüz kitap eklenmedi.',
    logs: 'Henüz okuma kaydı yok.',
    points: 'Henüz puan kaydı yok.',
    rewards: 'Henüz ödül tanımlanmadı.',
    groups: 'Henüz grup oluşturulmadı.',
    groupsArchived: 'Arşivde grup yok.',
    activeStudents: 'Bu grupta henüz talebe yok.',
  },

  // ── Snackbar ─────────────────────────────────────────────────────────────
  snackbar: {
    saved: 'Kaydedildi.',
    deleted: 'Silindi.',
    undoDelete: 'Geri Al',
    error: 'Bir hata oluştu.',
    copied: 'Kopyalandı.',
  },

  // ── Erişilebilirlik etiketleri ───────────────────────────────────────────
  a11y: {
    closeModal: 'Modalı kapat',
    openMenu: 'Menüyü aç',
    loading: 'İçerik yükleniyor',
    decreaseValue: 'Değeri azalt',
    increaseValue: 'Değeri artır',
    selectEmoji: 'Emoji seç',
    selectColor: 'Renk seç',
    avatar: (name: string) => `${name} avatarı`,
    badge: (count: number) => `${count} bildirim`,
    progress: (pct: number) => `İlerleme %${pct}`,
    switchOn: 'Açık',
    switchOff: 'Kapalı',
  },
} as const;

export default tr;

// Bu satırın altına hiçbir şey ekleme — otomatik üretilmiş kontrol alanı
