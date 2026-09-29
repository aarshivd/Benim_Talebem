/**
 * src/theme/ThemeProvider.tsx
 * React context ile tema ve varyant yönetimi.
 */

import React, { createContext, useContext, useMemo } from 'react';
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  FontFamily,
  FontSize,
  TextStyles,
  MinTouchTarget,
  AvatarEmojis,
  GroupEmojis,
  GroupPalette,
  ThemeVariant,
  VariantConfig,
} from './tokens';

// ─── TEMA NESNESİ ─────────────────────────────────────────────────────────────

export interface Theme {
  colors: typeof Colors;
  spacing: typeof Spacing;
  radius: typeof Radius;
  shadows: typeof Shadows;
  fontFamily: typeof FontFamily;
  fontSize: typeof FontSize;
  textStyles: typeof TextStyles;
  minTouchTarget: typeof MinTouchTarget;
  avatarEmojis: typeof AvatarEmojis;
  groupEmojis: typeof GroupEmojis;
  groupPalette: typeof GroupPalette;
  variant: ThemeVariant;
  variantConfig: (typeof VariantConfig)[ThemeVariant];
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<Theme | null>(null);

// ─── YARDIMCI: Seviyeden Varyant Belirle ─────────────────────────────────────

type EducationLevel = 'ilkokul' | 'ortaokul' | 'lise' | 'üniversite';

export function getVariant(level: EducationLevel): ThemeVariant {
  if (level === 'lise' || level === 'üniversite') return 'calm';
  return 'playful';
}

// ─── PROVIDER ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Varsayılan: 'playful' */
  variant?: ThemeVariant;
}

export function ThemeProvider({ children, variant = 'playful' }: ThemeProviderProps) {
  const theme = useMemo<Theme>(
    () => ({
      colors: Colors,
      spacing: Spacing,
      radius: Radius,
      shadows: Shadows,
      fontFamily: FontFamily,
      fontSize: FontSize,
      textStyles: TextStyles,
      minTouchTarget: MinTouchTarget,
      avatarEmojis: AvatarEmojis,
      groupEmojis: GroupEmojis,
      groupPalette: GroupPalette,
      variant,
      variantConfig: VariantConfig[variant],
    }),
    [variant],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

// ─── HOOK ────────────────────────────────────────────────────────────────────

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme — ThemeProvider dışında kullanıldı.');
  }
  return ctx;
}
