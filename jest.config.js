/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  testTimeout: 90000,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'node', 'ts'],
  moduleDirectories: ['node_modules'],
  verbose: true,
  setupFilesAfterEnv: ['./jest.global.js', 'jest-expect-message'],
  testResultsProcessor: './node_modules/jest-junit-reporter',
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: process.env.REPORT_NAME ? process.env.REPORT_NAME : 'test-report.html',
      },
    ],
  ],
}
