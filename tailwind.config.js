/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        neo: {
          bg: '#f8f6f0',       // Warm vintage paper cream
          surface: '#ffffff',  // Clean white
          dark: '#18181b',     // Deep ink black for borders/text
          primary: '#ffdf00',  // Neo yellow punch
          secondary: '#67e8f9',// Neo electric cyan
          accent: '#f43f5e',   // Neo hot coral pink
          green: '#22c55e',    // Neo mint green
          purple: '#c084fc',   // Neo lavender
          muted: '#71717a',    // Muted grey text
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #18181b',
        'neo': '3px 3px 0px #18181b',
        'neo-md': '4px 4px 0px #18181b',
        'neo-lg': '6px 6px 0px #18181b',
      },
      borderRadius: {
        'neo': '10px',
        'neo-lg': '14px',
      }
    },
  },
  plugins: [],
}
