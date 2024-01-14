/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  collectCoverage: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.(int|e2e)\\.test\\.ts$',
  testTimeout: 8 * 1000,
  maxWorkers: 1,
  rootDir: 'src',
  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',
  moduleNameMapper: {
    '^@webinar/(.*)$': '<rootDir>/modules/$1',
    '^src/(.*)$': '<rootDir>/$1',
  },
};
