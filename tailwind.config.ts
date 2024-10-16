import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },

    // colors: {    // This is the default color scheme.Remove all Tailwind default colors
    //   white: '#fff',
    //   red: '#f15922',
    //   grey: '#808080',
    // },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#2563eb',
            },
            secondary: {
              DEFAULT: '#f97316',
            },
            warning: {
              DEFAULT: '#f15922',
            },
            danger: {
              DEFAULT: '#ef4444',
            },
            divider: '#e6e6e6',
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#2563eb',
            },
            secondary: {
              DEFAULT: '#f97316',
            },
            warning: {
              DEFAULT: '#f15922',
            },
            danger: {
              DEFAULT: '#ef4444',
            },
            divider: '#e6e6e6',
          },
        },
      },
    }),
  ],
};

export default config;
