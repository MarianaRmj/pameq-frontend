// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verdeClaro: "#33A691",
        verdeOscuro: "#2C5959",
        verdeSuave: "#B8D9C4", // ✅ Este es el importante para la barra
        marronOscuro: "#593325",
        blancoSuave: "#F2F2F2",
        negro: "#171717",
        blancoConVerde: "#e4f7ec",
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        nunitoSans: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
