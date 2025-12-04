const config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  setupFiles: ["<rootDir>/jest.global-mocks.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};

export default config;
