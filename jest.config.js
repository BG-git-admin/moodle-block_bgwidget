module.exports = {
  setupFilesAfterEnv: ["<rootDir>/setup-jest.js"],
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/amd/tests'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleNameMapper: {
    '^jquery$': '<rootDir>/node_modules/jquery/dist/jquery.min.js',
    '^jqueryui$': '<rootDir>/node_modules/jqueryui/jquery-ui.min.js', 
    '^jquery-ui-dist$': '<rootDir>/node_modules/jquery-ui-dist/jquery-ui.min.js',
  },
};
