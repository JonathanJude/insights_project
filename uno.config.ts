import { defineConfig, presetAttributify, presetTypography, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'bounce-gentle': 'bounceGentle 2s infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      bounceGentle: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-5px)' },
      },
    },
    backdropBlur: {
      xs: '2px',
    },
  },
  shortcuts: {
    // Custom component shortcuts with dark mode support
    'card-gradient': 'bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)]',
    'primary-gradient': 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600',
    'secondary-gradient': 'bg-gradient-to-r from-emerald-500 to-teal-600',
    'accent-gradient': 'bg-gradient-to-r from-orange-500 to-pink-500',
    'success-gradient': 'bg-gradient-to-r from-green-500 to-emerald-600',
    'warning-gradient': 'bg-gradient-to-r from-yellow-500 to-orange-500',
    'danger-gradient': 'bg-gradient-to-r from-red-500 to-pink-600',
    'glass-effect': 'bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)]/20 shadow-xl',
    'hover-lift': 'transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg',
    'interactive-card': 'card-gradient hover-lift rounded-xl shadow-sm hover:shadow-xl transition-all duration-300',
    'btn-primary': 'primary-gradient text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30',
    'btn-secondary': 'bg-[var(--card-bg)] text-[var(--text-primary)] font-semibold py-2.5 px-6 rounded-lg border border-[var(--border-color)] shadow-sm hover:shadow-md hover:bg-[var(--bg-secondary)] transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30',
    'text-gradient': 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    'chart-container': 'interactive-card p-4 sm:p-6',
    // Theme-aware text and background utilities
    'text-primary': 'text-[var(--text-primary)]',
    'text-secondary': 'text-[var(--text-secondary)]',
    'bg-primary': 'bg-[var(--bg-primary)]',
    'bg-secondary': 'bg-[var(--bg-secondary)]',
    'bg-card': 'bg-[var(--card-bg)]',
    'border-default': 'border-[var(--border-color)]',
    // Mobile-specific utilities
    'touch-friendly': 'min-h-[44px] min-w-[44px] touch-manipulation',
    'mobile-padding': 'p-4 sm:p-6',
    'mobile-text': 'text-sm sm:text-base',
    'mobile-heading': 'text-lg sm:text-xl lg:text-2xl',
    'mobile-grid': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'mobile-flex': 'flex-col sm:flex-row',
    'mobile-space': 'space-y-4 sm:space-y-0 sm:space-x-4',
    'swipe-hint': 'relative after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-blue-500/10 after:to-transparent after:animate-pulse after:pointer-events-none',
  },
  content: {
    filesystem: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
  },
})