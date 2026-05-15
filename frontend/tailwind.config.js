/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#E8710A',
          dark: '#C45F06',
          light: '#FFF3E8',
        },
        maroon: {
          DEFAULT: '#7B1D0E',
          light: '#F9EDE8',
        },
        gold: {
          DEFAULT: '#C8960C',
          light: '#FFF8E1',
        },
        purpleTheme: {
          DEFAULT: '#5B2D8E',
          light: '#F3EEFF',
        },
        surface: '#FAF7F2',
        brandborder: '#EAD9CC',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
}
