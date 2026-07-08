import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pdv: {
          bg: "#07100B",
          bg2: "#101815",
          card: "#151F1B",
          border: "#26352C",
          green: "#8CCB19",
          green2: "#9FE01A",
          muted: "#9CA89D",
          text: "#F5F7F2",
          danger: "#DC2626",
          warning: "#EAB308"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(140,203,25,.22), 0 12px 45px rgba(0,0,0,.35)"
      }
    }
  },
  plugins: []
};
export default config;
