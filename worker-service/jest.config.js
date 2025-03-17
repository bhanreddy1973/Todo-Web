module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js"
  ],
  coverageReporters: ["lcov", "text", "html"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"]
};