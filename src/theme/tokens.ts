/**
 * src/theme/tokens.ts
 * Okuma Yıldızı — Tasarım Sistemi Token'ları
 *
 * Koda sabit renk/boşluk gömme yasaktır.
 * Tüm bileşenler bu dosyadaki sabitleri kullanır.
 */

// ─── RENKLER ─────────────────────────────────────────────────────────────────

export const Colors = {
  // Arka plan katmanları
  bg: '#FFF8EE',        // Krem: uygulama arka planı
  surface: '#FFFFFF',   // Kart / panel yüzeyi

  // Birincil marka rengi — mor/lavanta
  primary: '#6C5CE7',
  primarySoft: '#EFECFF',
  primaryDark: '#5649C0',  // Kontrast için koyulaştırılmış ton (WCAG AA)

  // Tematik renkler
  mint: '#00B894',      // Yeşil / başarı
  mintSoft: '#E0F7F2',
  sun: '#FDCB6E',       // Sarı / uyarı
  sunSoft: '#FEF5E1',
  coral: '#E05252',     // Kırmızı / tehlike — WCAG AA için #FF7675'den koyulaştırıldı
  coralSoft: '#FFE8E8',
  sky: '#4A90D9',       // Mavi — WCAG AA için #74B9FF'den koyulaştırıldı
  skySoft: '#EBF5FF',

  // Anlamsal takma adlar
  success: '#00B894',
  successSoft: '#E0F7F2',
  warning: '#D4A000',   // WCAG AA için koyulaştırıldı
  warningSoft: '#FEF5E1',
  danger: '#E05252',
  dangerSoft: '#FFE8E8',

  // Metin & kenarlık
  ink: '#2D3436',       // Birincil metin (bg üzerinde kontrast ~13:1 ✓)
  muted: '#5A6470',     // İkincil metin — WCAG AA için #636E72'den koyulaştırıldı
  border: '#EADFCF',    // Kenarlık / ayraç
  placeholder: '#9EA8B0',

  // Sabit
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlayBg: 'rgba(0,0,0,0.45)',   // Modal/BottomSheet karartma arka planı
} as const;

export type ColorKey = keyof typeof Colors;

// ─── 8 RENK GRUBU PALETİ (talebe grupları için) ──────────────────────────────

export const GroupPalette = [
  { bg: '#EFECFF', text: '#5649C0', border: '#C5BBFF', label: 'Mor' },
  { bg: '#E0F7F2', text: '#007A60', border: '#80D8C6', label: 'Yeşil' },
  { bg: '#FEF5E1', text: '#A07800', border: '#F5D890', label: 'Sarı' },
  { bg: '#FFE8E8', text: '#B03A3A', border: '#FFAAAA', label: 'Kırmızı' },
  { bg: '#EBF5FF', text: '#2666A4', border: '#90C4EE', label: 'Mavi' },
  { bg: '#FFF0E5', text: '#B05010', border: '#FFBE90', label: 'Turuncu' },
  { bg: '#F0FFF0', text: '#287028', border: '#90D090', label: 'Açık Yeşil' },
  { bg: '#F8E8FF', text: '#8030A0', border: '#D090F0', label: 'Pembe' },
] as const;

export type GroupPaletteItem = (typeof GroupPalette)[number];

// ─── 24 EMOJİ AVATAR SETİ (hayvan/doğa) ──────────────────────────────────────

export const AvatarEmojis = [
  '🐻', '🦁', '🐯', '🐼', '🦊', '🐺',
  '🐸', '🐧', '🦜', '🦋', '🐝', '🌟',
  '🦄', '🐬', '🦒', '🐘', '🦓', '🐙',
  '🌈', '🌸', '🍀', '🌻', '🐉', '🦅',
] as const;

export type AvatarEmoji = (typeof AvatarEmojis)[number];

// ─── 16 GRUP EMOJİSİ (kitap/okul/yıldız teması) ──────────────────────────────

export const GroupEmojis = [
  '📚', '⭐', '🌙', '✏️',
  '📖', '🏆', '🎯', '💡',
  '🔭', '🎨', '🎵', '🌿',
  '🚀', '🧩', '🌍', '🎓',
] as const;

export type GroupEmoji = (typeof GroupEmojis)[number];

// ─── BOŞLUK ──────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingKey = keyof typeof Spacing;

// ─── KÖŞE YARIÇAPI ───────────────────────────────────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export type RadiusKey = keyof typeof Radius;

// ─── GÖLGE / ELEVATION ───────────────────────────────────────────────────────

export const Shadows = {
  none: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export type ShadowKey = keyof typeof Shadows;

// ─── TİPOGRAFİ ───────────────────────────────────────────────────────────────

export const FontFamily = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 17,
  lg: 19,
  xl: 22,
  xxl: 26,
  xxxl: 32,
  display: 40,
} as const;

export type FontSizeKey = keyof typeof FontSize;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

/** Türkçe karakterleri kapsayan hazır metin stilleri */
export const TextStyles = {
  displayBold: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.display,
    lineHeight: FontSize.display * LineHeight.tight,
  },
  headingBold: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * LineHeight.tight,
  },
  titleSemiBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * LineHeight.normal,
  },
  bodyRegular: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  bodySemiBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  captionRegular: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  captionSemiBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  labelRegular: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
} as const;

// ─── DOKUNma ALANI ───────────────────────────────────────────────────────────

/** WCAG / Material: minimum dokunma alanı 48dp */
export const MinTouchTarget = 48;

// ─── VARYANT ─────────────────────────────────────────────────────────────────

/** 'playful' → yuvarlak, emoji, yoğun konfeti | 'calm' → daha sade */
export type ThemeVariant = 'playful' | 'calm';

export const VariantConfig: Record<
  ThemeVariant,
  {
    cardRadius: number;
    avatarStyle: 'emoji' | 'initials';
    confettiIntensity: 'high' | 'low';
    buttonRadius: number;
  }
> = {
  playful: {
    cardRadius: Radius.xl,
    avatarStyle: 'emoji',
    confettiIntensity: 'high',
    buttonRadius: Radius.full,
  },
  calm: {
    cardRadius: Radius.md,
    avatarStyle: 'initials',
    confettiIntensity: 'low',
    buttonRadius: Radius.lg,
  },
};
