module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{html,ts,scss}', './projects/**/*.{html,ts,scss}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
