/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#012d1d',
          hover: '#0c432d',
          light: '#ecfdf5', // bg-emerald-50 alike
          dark: '#012d1d',
        },
        secondary: {
          DEFAULT: '#fea619',
          hover: '#e29412',
          light: '#fffebf',
        }
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
