import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    dir: "./",
});

const customJestConfig = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^.+\\.(css|scss)$": "identity-obj-proxy",
    },
    moduleDirectories: ["node_modules", "<rootDir>/"],
    testEnvironment: "jest-environment-jsdom",
    collectCoverageFrom: [
        "components/**/*.{ts,tsx}",
        "stores/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
        "!app/api/**",
    ],
};

export default createJestConfig(customJestConfig);
