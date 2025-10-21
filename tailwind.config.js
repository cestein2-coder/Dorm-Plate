/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        food: {
          orange: '#FF6B35',
          green: '#4CAF50',
          yellow: {
            light: '#FFF9DB',
            DEFAULT: '#FFD600',
            dark: '#FFC107',
          },
          brown: {
            light: '#F5E9DA',
            DEFAULT: '#A0522D',
            dark: '#6B3F23',
          },
          cream: '#FFF8E1',
        },
      },
    },
  },
  plugins: [],
};
