/**
 * Jest configuration for ESM support and coverage settings.
 */
export default {
  // Use experimental VM modules to support ES Module syntax
  transform: {},
  extensionsToTreatAsEsm: [],

  // Test environment
  testEnvironment: "node",

  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/config/db.js" // Exclude DB config from coverage (requires live connection)
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 65,
      statements: 80
    }
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html"],

  // Test file pattern
  testMatch: ["**/tests/**/*.test.js"],

  // Timeout for async tests
  testTimeout: 30000,

  // Verbose output
  verbose: true
};
