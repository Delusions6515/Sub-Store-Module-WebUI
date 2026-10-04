import { Hct, SchemeTonalSpot, argbFromHex, hexFromArgb } from '@material/material-color-utilities'

// KernelSU 的 colors.css 提供宿主当前配色，而非明暗两套色板。
// 以其 primary 为种子生成两套 Material You 色板，再映射到 miuix token。
const roles = {
  primary: 'primary',
  'on-primary': 'onPrimary',
  'primary-variant': 'primary',
  'on-primary-variant': 'onPrimary',
  'primary-container': 'primaryContainer',
  'on-primary-container': 'onPrimaryContainer',
  error: 'error',
  'on-error': 'onError',
  'error-container': 'errorContainer',
  'on-error-container': 'onErrorContainer',
  'disabled-primary': 'surfaceContainerHighest',
  'disabled-on-primary': 'onSurfaceVariant',
  'disabled-primary-button': 'surfaceContainerHighest',
  'disabled-on-primary-button': 'onSurfaceVariant',
  'disabled-primary-slider': 'surfaceContainerHighest',
  secondary: 'secondary',
  'on-secondary': 'onSecondary',
  'secondary-variant': 'surfaceContainerHigh',
  'on-secondary-variant': 'onSurface',
  'disabled-secondary': 'surfaceContainerLow',
  'disabled-on-secondary': 'outline',
  'disabled-secondary-variant': 'surfaceContainer',
  'disabled-on-secondary-variant': 'outline',
  'secondary-container': 'secondaryContainer',
  'on-secondary-container': 'onSecondaryContainer',
  'secondary-container-variant': 'secondaryContainer',
  'on-secondary-container-variant': 'onSecondaryContainer',
  'tertiary-container': 'tertiaryContainer',
  'on-tertiary-container': 'onTertiaryContainer',
  'tertiary-container-variant': 'tertiaryContainer',
  background: 'background',
  'on-background': 'onBackground',
  'on-background-variant': 'onSurfaceVariant',
  surface: 'surface',
  'on-surface': 'onSurface',
  'surface-variant': 'surfaceContainer',
  'on-surface-secondary': 'onSurfaceVariant',
  'on-surface-variant-summary': 'onSurfaceVariant',
  'on-surface-variant-actions': 'onSurfaceVariant',
  'disabled-on-surface': 'outline',
  'surface-container': 'surfaceContainer',
  'on-surface-container': 'onSurface',
  'on-surface-container-variant': 'onSurfaceVariant',
  'surface-container-high': 'surfaceContainerHigh',
  'on-surface-container-high': 'onSurfaceVariant',
  'surface-container-highest': 'surfaceContainerHighest',
  'on-surface-container-highest': 'onSurface',
  outline: 'outline',
  'divider-line': 'outlineVariant',
  'slider-key-point': 'outlineVariant',
  'slider-key-point-foreground': 'primary',
  'slider-background': 'surfaceContainerHigh',
}

export function createMonetPalettes(seed) {
  // 宿主使用 #RRGGBB 或 #RRGGBBFF；缺失/非不透明颜色保留原主题。
  if (typeof seed !== 'string' || !/^#[\da-f]{6}(ff)?$/i.test(seed.trim())) return null
  const source = Hct.fromInt(argbFromHex(seed.trim().slice(0, 7)))

  function palette(isDark) {
    const scheme = new SchemeTonalSpot(source, isDark, 0)
    const colors = Object.fromEntries(
      Object.entries(roles).map(([token, role]) => [`--m-color-${token}`, hexFromArgb(scheme[role])]),
    )
    colors['--m-color-window-dimming'] = `${hexFromArgb(scheme.scrim)}${isDark ? '99' : '4d'}`
    return colors
  }

  return { light: palette(false), dark: palette(true) }
}
