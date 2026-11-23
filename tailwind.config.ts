import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { bg: '#071A17', card: '#0E2924', line: '#1B433C', primary: '#2A8C78', gold: '#EAB308' },
      fontFamily: { sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
