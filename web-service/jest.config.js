// web-service/jest.config.js

module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Handle CSS imports
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], // Optional: Setup file for mocks, etc.
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.stories.{js,jsx,ts,tsx}', // Exclude story files
      '!src/index.js',                    // Exclude entry point
    ],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: '.', outputName: 'junit.xml' }],
    ],
  };
  