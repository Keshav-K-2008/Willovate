/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Arial', 'sans-serif'],
        body: ['Arial', 'sans-serif'],
        mono: ['Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
        },
        dark: {
          900: 'var(--bg-dark-900)',
          800: 'var(--bg-dark-800)',
          700: 'var(--bg-dark-700)',
          600: 'var(--bg-dark-600)',
          500: 'var(--bg-dark-500)',
          400: 'var(--bg-dark-400)',
        },
        slate: {
          100: 'var(--text-slate-100)',
          200: 'var(--text-slate-200)',
          300: 'var(--text-slate-300)',
          400: 'var(--text-slate-400)',
          500: 'var(--text-slate-500)',
          600: 'var(--text-slate-600)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
