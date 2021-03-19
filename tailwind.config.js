const args = process.argv.join(' ');

module.exports = {
  purge: {
    enabled:
      process.env.WEBPACK_DEV_SERVER === 'true' && (args.indexOf('build') !== -1 || args.indexOf('deploy') !== -1),
    content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      borderWidth: ['hover', 'group-hover'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
