/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',

  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@vespaiach/axios-fetch-adapter)/)'],
  testEnvironment: 'node',
  restoreMocks: true,
  resetMocks: true,
  resetModules: true,
  moduleNameMapper: {
    'netmock-js': '<rootDir>/src/index',
  },
  setupFilesAfterEnv: ['./src/jest-setup.ts'],
};
