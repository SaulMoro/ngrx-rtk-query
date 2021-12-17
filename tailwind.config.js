module.exports = {
  content: ['./src/**/*.{html,ts,scss}', './projects/**/*.{html,ts,scss}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
