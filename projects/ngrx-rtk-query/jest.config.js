const baseConfig = require('../../jest.config');

module.exports = {
  ...baseConfig,
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.spec.json',
    },
  },
  moduleNameMapper: {
    'ngrx-rtk-query': '<rootDir>/src/public-api.ts',
  },
};
