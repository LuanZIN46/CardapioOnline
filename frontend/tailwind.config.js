/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        brand: {
          black: '#111111',
          gold: '#D4AF37',
          white: '#FFFFFF',
          gray: '#222222',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#1a1a1a',
          muted: '#222222',
          border: '#2e2e2e',
        },
        gold: {
          50: '#fdf9ec',
          100: '#f8eec8',
          200: '#f0dc92',
          300: '#e5c65c',
          400: '#d4af37',
          500: '#bd9a2c',
          600: '#9a7a24',
          700: '#755b1f',
          800: '#513f1c',
          900: '#312716',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(0, 0, 0, 0.6)',
        gold: '0 8px 32px -12px rgba(212, 175, 55, 0.45)',
        sheet: '0 -8px 40px -12px rgba(0, 0, 0, 0.75)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 240ms ease-out',
        'slide-up': 'slide-up 280ms ease-out',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
