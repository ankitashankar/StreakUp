/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f1f6f1',
          100: '#e3ebe2',
          200: '#c7d8c5',
          300: '#9fbc9b',
          400: '#729c6e',
          500: '#527d4e',
          600: '#3f643c',
          700: '#345031',
          800: '#2c4129',
          900: '#263624',
          950: '#121d11',
        },
        violet: {
          soft: '#8b7fb8',
          DEFAULT: '#7c6fb0',
          50: '#f5f3fa',
          100: '#ece8f5',
          200: '#dad2ee',
          300: '#c0b2e3',
          400: '#a48bd3',
          500: '#7c6fb0',
          600: '#6a5c9d',
          700: '#574b82',
          800: '#483f6b',
          900: '#3d3659',
        },
        amber: {
          muted: '#d99a3f',
          DEFAULT: '#e09132',
        },
        ink: {
          DEFAULT: '#262626',
          soft: '#4a4a4a',
          muted: '#6b6b6b',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        cardHover: '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
        glow: '0 0 0 1px rgba(82,125,78,0.15), 0 8px 30px rgba(82,125,78,0.12)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        checkPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        flameFlicker: {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.08) rotate(2deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pop: 'pop 0.3s ease-out',
        checkPop: 'checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        flameFlicker: 'flameFlicker 1.6s ease-in-out infinite',
        slideUp: 'slideUp 0.3s ease-out',
        fadeIn: 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
