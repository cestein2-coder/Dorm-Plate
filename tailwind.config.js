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
          brown: {
            light: '#F5E9DA', // light brown (bread)
            DEFAULT: '#A0522D', // main brown (bread crust)
            dark: '#6B3F23', // dark brown (coffee)
          },
          cream: '#FFF8E1', // background (cream)
        },
      },
    },
  },
  plugins: [],
};
