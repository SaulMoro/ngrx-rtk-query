process.env.TAILWIND_MODE = isProductionMode() ? 'build' : 'watch';

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

function isProductionMode() {
  const argv = process.argv.join(' ').toLowerCase();
  const isBuild = argv.includes(' build');
  const isDeploy = argv.includes(' deploy');
  const isBuildAlias = argv.includes('ng b');
  const isFlag = argv.includes('--prod');
  const isProdEnv = process.env.NODE_ENV === 'production';
  return isBuild || isDeploy || isFlag || isProdEnv || isBuildAlias;
}
