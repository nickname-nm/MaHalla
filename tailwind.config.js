// Tailwind CSS configuration for MaHalla Stunden
// Defines brand colours and default font

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Mahalla brand colours
        'mahalla-red': '#FB0007',
        'mahalla-black': '#000000',
        'mahalla-white': '#FFFFFF'
      },
      fontFamily: {
        // Use system Helvetica stack — no external font import needed
        sans: ['Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}
