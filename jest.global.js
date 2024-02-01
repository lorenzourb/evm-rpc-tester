// ******************************
// Jest config
// ******************************

const SECONDS = 1000

/** @type {import('jest').Config} */
const config = {
  testTimeout: 75 * SECONDS,
  setupFilesAfterEnv: ['./setup-jest.js'],
}
module.exports = config
