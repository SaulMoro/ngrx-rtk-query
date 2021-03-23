module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
    '@environments/(.*)': '<rootDir>/src/environments/$1',
    'ngrx-rtk-query': '<rootDir>/projects/ngrx-rtk-query/src/public-api.ts',
  },
  testPathIgnorePatterns: ['<rootDir>[/\\\\](node_modules|e2e|projects)[/\\\\]'],
};
