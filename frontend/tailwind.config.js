export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#0D0D0D",
        surface: "#1A1A1A",
        border:  "#2A2A2A",
        brand:   "#E8854A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"]
      }
    }
  }
}
