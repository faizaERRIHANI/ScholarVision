/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:         '#0b1437',
        'navy-mid':   '#112060',
        blue:         '#1a56db',
        'blue-light': '#3b82f6',
        'blue-sky':   '#eff6ff',
        gold:         '#f59e0b',
        emerald:      '#10b981',
        rose:         '#f43f5e',
        violet:       '#7c3aed',
        surface:      '#f8fafc',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        dmSans:   ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:     ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:         '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10)',
        dropdown:     '0 8px 32px rgba(0,0,0,0.12)',
      },
      keyframes: {
        'fade-in':  { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'live-dot': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.4)' } },
        skeleton:   { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
      animation: {
        'fade-in':  'fade-in 0.25s ease-out',
        'live-dot': 'live-dot 1.2s ease-in-out infinite',
        skeleton:   'skeleton 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
