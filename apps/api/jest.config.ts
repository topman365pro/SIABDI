import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  moduleFileExtensions: ["js", "json", "ts"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json"
      }
    ]
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/generated/**"],
  coverageDirectory: "./coverage",
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/test/.*\\.e2e-spec\\.ts$"]
};

export default config;
