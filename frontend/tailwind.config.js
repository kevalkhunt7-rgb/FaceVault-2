/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#fafafa", // Soft whites
        secondary: "#64748b", // Slate gray
        accent: {
          gold: "#d4af37", // Soft gold
          sage: "#9dc183", // Sage green
        }
      }
    },
  },
  plugins: [],
}
