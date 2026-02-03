export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';
export * from './sports';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';
import { animations } from './animations';
import { sportsColors, sportsTypography, sportsAnimations, sportsShadows } from './sports';

export const theme = {
  colors,
  typography,
  spacing,
  layout,
  animations,
  sports: {
    colors: sportsColors,
    typography: sportsTypography,
    animations: sportsAnimations,
    shadows: sportsShadows,
  },
} as const;

export type Theme = typeof theme; 