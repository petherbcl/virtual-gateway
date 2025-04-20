/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        'background': 'background-color',
        'text': 'color',
      },
    },
  },
  plugins: [],
}
