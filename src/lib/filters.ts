// CSS filter presets shared by video & photo editors.

export interface FilterDef {
  key: string;
  label: string;
  css: string;
}

// 15 filters for video
export const VIDEO_FILTERS: FilterDef[] = [
  { key: 'none', label: 'Original', css: 'none' },
  { key: 'vivid', label: 'Vivid', css: 'saturate(1.45) contrast(1.12)' },
  { key: 'warm', label: 'Warm', css: 'sepia(0.25) saturate(1.3) hue-rotate(-10deg)' },
  { key: 'cool', label: 'Cool', css: 'saturate(1.1) hue-rotate(20deg) brightness(1.05)' },
  { key: 'vintage', label: 'Vintage', css: 'sepia(0.45) contrast(1.05) saturate(0.85)' },
  { key: 'mono', label: 'B&W', css: 'grayscale(1) contrast(1.1)' },
  { key: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.45) brightness(0.9)' },
  { key: 'fade', label: 'Fade', css: 'contrast(0.85) saturate(0.8) brightness(1.08)' },
  { key: 'dramatic', label: 'Dramatic', css: 'contrast(1.35) saturate(1.15) brightness(0.95)' },
  { key: 'golden', label: 'Golden', css: 'sepia(0.3) saturate(1.4) hue-rotate(-18deg) brightness(1.05)' },
  { key: 'teal', label: 'Teal', css: 'hue-rotate(160deg) saturate(1.3) contrast(1.05)' },
  { key: 'rose', label: 'Rose', css: 'sepia(0.2) hue-rotate(300deg) saturate(1.3)' },
  { key: 'cinema', label: 'Cinema', css: 'contrast(1.2) saturate(0.9) brightness(0.95) hue-rotate(-6deg)' },
  { key: 'pastel', label: 'Pastel', css: 'saturate(0.75) brightness(1.12) contrast(0.95)' },
  { key: 'cyber', label: 'Cyber', css: 'hue-rotate(220deg) saturate(1.6) contrast(1.15)' },
];

// 20 filters for photo (superset)
export const PHOTO_FILTERS: FilterDef[] = [
  ...VIDEO_FILTERS,
  { key: 'lark', label: 'Lark', css: 'saturate(1.05) brightness(1.08) contrast(0.96)' },
  { key: 'juno', label: 'Juno', css: 'sepia(0.15) saturate(1.35) hue-rotate(-8deg)' },
  { key: 'slumber', label: 'Slumber', css: 'sepia(0.3) saturate(1.1) brightness(1.05)' },
  { key: 'crema', label: 'Crema', css: 'sepia(0.2) contrast(1.05) brightness(1.02)' },
  { key: 'perpetua', label: 'Perpetua', css: 'saturate(1.2) hue-rotate(12deg) brightness(1.04)' },
];

export function filterCss(key: string): string {
  return (
    [...VIDEO_FILTERS, ...PHOTO_FILTERS].find((f) => f.key === key)?.css ??
    'none'
  );
}

export function adjustCss(opts: {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  blur?: number;
}): string {
  const b = opts.brightness ?? 1;
  const c = opts.contrast ?? 1;
  const s = opts.saturation ?? 1;
  const blur = opts.blur ?? 0;
  // sharpness via contrast-ish approximation (no native CSS sharpen)
  const parts = [
    `brightness(${b})`,
    `contrast(${c})`,
    `saturate(${s})`,
  ];
  if (blur > 0) parts.push(`blur(${blur}px)`);
  return parts.join(' ');
}

export function vignetteStyle(amount: number): React.CSSProperties {
  if (amount <= 0) return {};
  return {
    boxShadow: `inset 0 0 ${Math.round(amount * 120)}px rgba(0,0,0,${Math.min(amount, 0.9).toFixed(2)})`,
  };
}
