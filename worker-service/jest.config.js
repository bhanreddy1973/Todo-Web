// worker-service/jest.config.js

module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
      '**/*.js',         // Include all JavaScript files
      '!**/node_modules/**', // Exclude node_modules
      '!**/test/**',      // Exclude test directory
    ],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: '.', outputName: 'junit.xml' }],
    ],
  };
  