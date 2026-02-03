import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sports / broadcast palette
        sports: {
          surface: {
            dark: '#0a0e17',
            card: '#111827',
            elevated: '#1a2234',
          },
          accent: {
            blue: '#0ea5e9',
            'blue-bright': '#38bdf8',
            'blue-dark': '#0284c7',
          },
          highlight: {
            orange: '#f97316',
            gold: '#eab308',
            amber: '#f59e0b',
          },
          live: {
            red: '#ef4444',
          },
          neutral: {
            white: '#ffffff',
            'off-white': '#f1f5f9',
            muted: '#94a3b8',
            dim: '#64748b',
          },
        },
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#1E3A8A',
          600: '#1E40AF',
          700: '#1E3A8A',
          800: '#1E3A8A',
          900: '#1E3A8A',
        },
        secondary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FB923C',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        accent: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        background: {
          primary: '#F8FAFC',
          secondary: '#F1F5F9',
          tertiary: '#E2E8F0',
        },
        text: {
          primary: '#0F172A',
          secondary: '#334155',
          tertiary: '#64748B',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        'sports-display': ['var(--font-sports-display)', 'Oswald', 'Poppins', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        fadeOut: 'fadeOut 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-in-out',
        slideOut: 'slideOut 0.3s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
        'slideInFromBottom': 'slideInFromBottom 0.5s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Sports / broadcast
        'sports-fade-up': 'sportsFadeInUp 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'sports-slide-right': 'sportsSlideInRight 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'sports-scale-in': 'sportsScaleIn 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards',
        'sports-glow-pulse': 'sportsGlowPulse 2s ease-in-out infinite',
        'sports-live-pulse': 'sportsLivePulse 1.5s ease-in-out infinite',
        'sports-shimmer': 'sportsShimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        slideInFromBottom: {
          '0%': { 
            transform: 'translateY(20px)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
        sportsFadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sportsSlideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        sportsScaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
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
      },
      backgroundImage: {
        'sports-hero': 'linear-gradient(135deg, #0a0e17 0%, #1a2234 50%, #0f172a 100%)',
        'sports-accent-bar': 'linear-gradient(90deg, #0ea5e9, #f97316)',
        'sports-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.2), transparent)',
      },
      boxShadow: {
        'sports-card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'sports-elevated': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'sports-glow': '0 0 24px rgba(14, 165, 233, 0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config 