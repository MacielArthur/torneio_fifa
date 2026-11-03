/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eafc: {
          neon: '#00ff87',      // EA FC Signature Neon Green
          cyan: '#60efff',      // Accent Cyan
          emerald: '#00df82',   // Secondary Neon
          dark: '#0a0e17',      // Deep Navy Background
          card: '#111827',      // Elevated Card Background
          cardHover: '#17223b', // Hover Card Background
          border: '#1f293d',    // Border tone
          accent: '#1e293b',
          muted: '#8e9bb0',     // Subtle text
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Rajdhani', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 255, 135, 0.35)',
        'neon-lg': '0 0 25px rgba(0, 255, 135, 0.55)',
        'cyan-glow': '0 0 15px rgba(96, 239, 255, 0.35)',
      }
    },
  },
  plugins: [],
};

