/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        fog: '#e2e8f0',
        accent: '#16a34a'
      }
    }
  },
  plugins: []
};
