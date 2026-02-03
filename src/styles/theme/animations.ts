export const animations = {
  transition: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideIn: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
    slideOut: {
      from: { transform: 'translateY(0)' },
      to: { transform: 'translateY(100%)' },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    pulse: {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
    },
    // Sports / broadcast-style
    sportsFadeInUp: {
      from: { opacity: '0', transform: 'translateY(16px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
    sportsSlideInRight: {
      from: { opacity: '0', transform: 'translateX(20px)' },
      to: { opacity: '1', transform: 'translateX(0)' },
    },
    sportsScaleIn: {
      from: { opacity: '0', transform: 'scale(0.96)' },
      to: { opacity: '1', transform: 'scale(1)' },
    },
    sportsGlowPulse: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.15)' },
      '50%': { boxShadow: '0 0 32px rgba(14, 165, 233, 0.3)' },
    },
    sportsLivePulse: {
      '0%, 100%': { opacity: '1', transform: 'scale(1)' },
      '50%': { opacity: '0.85', transform: 'scale(1.02)' },
    },
    sportsShimmer: {
      '0%': { backgroundPosition: '200% 0' },
      '100%': { backgroundPosition: '-200% 0' },
    },
    sportsSweep: {
      '0%': { clipPath: 'inset(0 100% 0 0)' },
      '100%': { clipPath: 'inset(0 0 0 0)' },
    },
    sportsTicker: {
      '0%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(-50%)' },
    },
  },
} as const;

export type TransitionDuration = keyof typeof animations.transition.duration;
export type TransitionTiming = keyof typeof animations.transition.timing;
export type AnimationKeyframe = keyof typeof animations.keyframes; 