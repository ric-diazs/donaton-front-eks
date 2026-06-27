/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:  "#071A36",
        teal:  "#00E5CC",
        coral: "#FF3B5C",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "scroll-logos": "scrollLogos 25s linear infinite",
      },
      keyframes: {
        scrollLogos: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
