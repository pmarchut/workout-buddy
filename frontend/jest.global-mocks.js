// Global mock dla config.js
jest.mock("./src/config", () => ({
  API_URL: "http://localhost:4000"
}));
