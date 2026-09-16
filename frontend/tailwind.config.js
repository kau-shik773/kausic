/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yt: {
          dark: '#030303',
          card: '#181818',
          hover: '#282828',
          border: '#303030',
          red: '#FF0000',
          accent: '#FF0033',
          text: '#AAAAAA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
