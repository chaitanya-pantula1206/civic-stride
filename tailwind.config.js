/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        editorial: {
          bg: {
            light: '#F8FAFC',
            cream: '#F5F5F0',
            paper: '#FAF9F6',
            muted: '#F1F5F9',
          },
          text: {
            primary: '#1E293B',
            secondary: '#475569',
            muted: '#64748B',
          },
          accent: {
            green: '#15803D',      // Muted forest green for sustainability
            greenLight: '#E8F5E9',
            amber: '#B45309',      // Soft amber for alert indices
            amberLight: '#FEF3C7',
            stone: '#78716C',      // Neutral stone grey
            slate: '#475569',
          },
          border: '#E2E8F0',
        }
      },
      boxShadow: {
        editorial: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        editorialMd: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
