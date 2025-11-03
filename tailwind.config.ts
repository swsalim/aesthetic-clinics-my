import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './config/**/*.{js,ts}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: colors.white,
      black: colors.black,
      blue: {
        DEFAULT: '#2A669F',
        50: '#E4F7F8',
        100: '#CCEEF2',
        200: '#9CD7E5',
        300: '#6CB9D8',
        400: '#3B94CB',
        500: '#2A669F',
        600: '#234B83',
        700: '#1B3366',
        800: '#14204A',
        900: '#0C102E',
      },
      red: colors.red,
      violet: colors.violet,
      green: colors.green,
      yellow: colors.yellow,
      gray: colors.stone,
      amber: colors.amber,
      cyan: colors.cyan,
    },
    fontFamily: {
      sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: '#FF4A52',
      },
      gridTemplateColumns: {
        sidebar: '1fr 320px',
        'sidebar-left': '320px 1fr',
      },
      keyframes: {
        'bounce-left': {
          '0%, 100%': {
            transform: 'translateX(-25%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateX(0)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      animation: {
        'bounce-left': 'bounce-left 1s infinite',
      },
    },
  },
  plugins: [typography, animate],
} satisfies Config;
