/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest', 
    '^.+\\.(js|jsx)$': 'babel-jest', 
  },
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!your-package-to-transform).*/', 
  ],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy', 
  },
};

export default config;