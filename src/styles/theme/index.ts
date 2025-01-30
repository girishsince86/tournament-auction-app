export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';
import { animations } from './animations';

export const theme = {
  colors,
  typography,
  spacing,
  layout,
  animations,
} as const;

export type Theme = typeof theme; 