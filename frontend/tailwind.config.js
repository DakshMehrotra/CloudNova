/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1a73e8",
        sidebar: "#f8f9fa",
      },
    },
  },
  plugins: [],
};
