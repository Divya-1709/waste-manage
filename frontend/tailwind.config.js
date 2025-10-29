/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003D5C',
        secondary: '#718096',
        accent: '#16a34a',
        neutral: '#f8fafc',
      },
    },
  },
  plugins: [],
}
