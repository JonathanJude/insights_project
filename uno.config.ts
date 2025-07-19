import { defineConfig, presetUno, presetAttributify, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
  ],
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
    // Custom component shortcuts equivalent to Tailwind @layer components
    'card-gradient': 'bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm',
    'primary-gradient': 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600',
    'secondary-gradient': 'bg-gradient-to-r from-emerald-500 to-teal-600',
    'accent-gradient': 'bg-gradient-to-r from-orange-500 to-pink-500',
    'success-gradient': 'bg-gradient-to-r from-green-500 to-emerald-600',
    'warning-gradient': 'bg-gradient-to-r from-yellow-500 to-orange-500',
    'danger-gradient': 'bg-gradient-to-r from-red-500 to-pink-600',
    'glass-effect': 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl',
    'hover-lift': 'transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg',
    'interactive-card': 'card-gradient hover-lift border border-gray-200/50 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300',
    'btn-primary': 'primary-gradient text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30',
    'btn-secondary': 'bg-white text-gray-700 font-semibold py-2.5 px-6 rounded-lg border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30',
    'text-gradient': 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    'chart-container': 'interactive-card p-6',
  },
  content: {
    filesystem: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
  },
})