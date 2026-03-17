import type { Config } from 'tailwindcss'

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tool: {
          bash: '#22c55e',
          read: '#3b82f6',
          grep: '#eab308',
          agent: '#a855f7',
          edit: '#f97316',
          write: '#06b6d4',
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
