/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#012d1d',
          orange: '#fea619',
          brown: '#76290D',
          light: '#f8f9ff',
          text: '#414844',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        pirata: ['"Pirata One"', 'cursive'],
        grenze: ['"Grenze Gotisch"', 'serif'],
      }
    },
  },
  plugins: [],
}
