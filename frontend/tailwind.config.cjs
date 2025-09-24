/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // all JS/TS files
    "./src/**/*.css",              // in case you use Tailwind in CSS files
  ],
  darkMode: "class",
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
    },
  },
  // plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};
