/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFB800",
        primarySoft: "#FFF5D6",
        dark: "#1E1E2F",
        muted: "#6B7280",
        border: "#F1F1F3",
        bg: "#F9FAFB",
      },
    },
  },
  plugins: [],
};