/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        felt: '#1a4731',
        'felt-dark': '#133524',
        'felt-light': '#22603f',
      },
    },
  },
  plugins: [],
};
