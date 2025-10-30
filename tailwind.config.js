/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        food: {
          yellow: {
            light: '#FFF9DB', // light yellow (egg)
            DEFAULT: '#FFD600', // main yellow (cheese, yolk)
            dark: '#FFC107', // dark yellow (toasted cheese)
          },
          orange: {
            light: '#FFE5CC', // light orange
            DEFAULT: '#FF8C42', // main orange (vibrant)
            dark: '#E67635', // dark orange
          },
          green: {
            light: '#E8F5E9', // light green
            DEFAULT: '#4CAF50', // main green (fresh)
            dark: '#388E3C', // dark green
          },
          brown: {
            light: '#F5E9DA', // light brown (bread)
            DEFAULT: '#8B4513', // main brown (saddle brown - better contrast)
            dark: '#5D2E0F', // dark brown (coffee)
          },
          cream: {
            light: '#FFFEF7', // very light cream
            DEFAULT: '#FFF8E1', // background (cream)
            dark: '#F5E9D3', // darker cream for borders
          },
        },
      },
    },
  },
  plugins: [],
};
