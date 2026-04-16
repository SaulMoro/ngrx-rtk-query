const path = require('path');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  plugins: ['@nx'],
  settings: {
    tailwindcss: {
      callees: ['cva', 'cn'],
      config: path.join(__dirname, 'examples/basic-ngrx-store/tailwind.config.cjs'),
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: '*',
                onlyDependOnLibsWithTags: ['*'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['import'],
      extends: ['plugin:@nx/typescript', 'plugin:tailwindcss/recommended'],
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: ['memberLike'],
            modifiers: ['private'],
            prefix: ['#'],
            format: null,
          },
        ],
        'tailwindcss/no-custom-classname': 'off',
        'tailwindcss/classnames-order': 'error',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx'],
      extends: ['plugin:vitest/recommended', 'plugin:jest-dom/recommended', 'plugin:testing-library/angular'],
      rules: {
        'testing-library/prefer-explicit-assert': 'error',
      },
    },
  ],
};
