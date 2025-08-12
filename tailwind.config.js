/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#2C5959",
        brandInk: "#2A5559",
        accent: "#33A691",
        verdeClaro: "#33A691",
        verdeOscuro: "#2C5959",
        verdeSuave: "#B8D9C4",
        marronOscuro: "#593325",
        blancoSuave: "#F2F2F2",
        negro: "#171717",
        blancoConVerde: "#e4f7ec",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        geist: ["Geist", "sans-serif"],
        mono: ["Fira Code", "monospace"],
        nunitoSans: ["Nunito Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
