/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        navy: {
          800: '#0f172a',
          900: '#060b18',
        },
        surface: '#f8fafc',
      },
      fontFamily: {
        // Lexend: designed specifically to reduce visual stress and improve reading proficiency
        sans: ['Lexend', 'ui-sans-serif', 'system-ui'],
      },
      letterSpacing: {
        reading: '0.02em',
      },
      lineHeight: {
        reading: '1.8',
      },
      fontSize: {
        base: ['17px', { lineHeight: '1.8' }],
      },
      spacing: {
        'read': '0.05em',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.10)',
        'sidebar': '2px 0 8px 0 rgb(0 0 0 / 0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                   to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}


