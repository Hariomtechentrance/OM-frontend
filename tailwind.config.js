/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blacklocust: {
          black: '#000000',
          white: '#FFFFFF',
          gold: '#C19A6B',
          text: {
            primary: '#111111',
            secondary: '#6B7280',
          },
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        heading: ['\"Playfair Display\"', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        luxe: '0 18px 45px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      spacing: {
        section: '80px',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

