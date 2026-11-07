/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { forest: '#1F4D3A', leaf: '#7BB661', mist: '#EAF3E4', paper: '#F7F8F3', ink: '#1B2A22' },
      fontFamily: { sans: ['"Avenir Next"', '"Segoe UI"', 'system-ui', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
}
