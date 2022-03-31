/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    'netmock-js': '<rootDir>/src/index',
  },
  setupFilesAfterEnv: ['./internal-jest-setup.ts'],
};
