/**
 * Sports presentation / broadcast-style theme tokens.
 * Inspiration: ESPN, sports scorebugs, tournament coverage, live graphics.
 */

export const sportsColors = {
  /** Deep broadcast background */
  surface: {
    dark: '#0a0e17',
    card: '#111827',
    elevated: '#1a2234',
    overlay: 'rgba(10, 14, 23, 0.85)',
  },
  /** Primary accent – electric blue / broadcast blue */
  accent: {
    blue: '#0ea5e9',
    blueBright: '#38bdf8',
    blueDark: '#0284c7',
  },
  /** Secondary – orange/gold for scores and highlights */
  highlight: {
    orange: '#f97316',
    gold: '#eab308',
    amber: '#f59e0b',
  },
  /** Status / live */
  live: {
    red: '#ef4444',
    pulse: 'rgba(239, 68, 68, 0.6)',
  },
  /** Neutrals for text on dark */
  neutral: {
    white: '#ffffff',
    offWhite: '#f1f5f9',
    muted: '#94a3b8',
    dim: '#64748b',
  },
  /** Gradient definitions for CSS */
  gradients: {
    hero: 'linear-gradient(135deg, #0a0e17 0%, #1a2234 50%, #0f172a 100%)',
    card: 'linear-gradient(180deg, rgba(26, 34, 52, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)',
    accentBar: 'linear-gradient(90deg, #0ea5e9, #f97316)',
    glow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.25), transparent)',
  },
} as const;

export const sportsTypography = {
  /** Condensed / display for headlines (score-style) */
  display: {
    fontFamily: '"Bebas Neue", "Oswald", "Poppins", sans-serif',
    letterSpacing: '0.02em',
  },
  /** Uppercase labels (e.g. "LIVE", "FINAL") */
  label: {
    letterSpacing: '0.15em',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  /** Large numbers (scores, stats) */
  stat: {
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
} as const;

export const sportsAnimations = {
  /** Stagger delays for list/card reveals */
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
  /** Keyframe names for Tailwind/globals */
  keyframes: {
    fadeInUp: 'sports-fade-in-up',
    slideInRight: 'sports-slide-in-right',
    scaleIn: 'sports-scale-in',
    glowPulse: 'sports-glow-pulse',
    livePulse: 'sports-live-pulse',
    shimmer: 'sports-shimmer',
    sweep: 'sports-sweep',
    ticker: 'sports-ticker',
  },
  /** Durations */
  duration: {
    instant: '150ms',
    fast: '250ms',
    normal: '400ms',
    slow: '600ms',
    dramatic: '800ms',
  },
  /** Easing – snappy for UI, smooth for hero */
  easing: {
    snap: 'cubic-bezier(0.32, 0.72, 0, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0.33, 1, 0.68, 1)',
  },
} as const;

export const sportsShadows = {
  card: '0 4px 24px rgba(0, 0, 0, 0.4)',
  elevated: '0 8px 32px rgba(0, 0, 0, 0.5)',
  glow: '0 0 24px rgba(14, 165, 233, 0.2)',
  inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
} as const;
