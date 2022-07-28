/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',

  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@vespaiach/axios-fetch-adapter)/)'],
  testEnvironment: 'node',
  moduleNameMapper: {
    'netmock-js': '<rootDir>/src/index',
  },
  setupFilesAfterEnv: ['./internal-jest-setup.ts'],
};
