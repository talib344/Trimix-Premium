/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a14',
          900: '#0f0f1e',
          800: '#161629',
          700: '#1f1f38',
          600: '#2a2a4a',
        },
        brand: {
          50: '#f3f0ff',
          100: '#e9e3ff',
          200: '#d4c7ff',
          300: '#b39dff',
          400: '#9170ff',
          500: '#7a52f5',
          600: '#6a3ee0',
          700: '#5a30c2',
          800: '#4a28a0',
          900: '#3d227e',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', 'Jameel Noori Nastaleeq', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.22,1,0.36,1)',
        'pop': 'pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer': 'shimmer 1.8s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(122,82,245,0.35)' },
          '50%': { boxShadow: '0 0 32px rgba(122,82,245,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
