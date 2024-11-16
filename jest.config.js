module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        'popup/**/*.js',
        'background.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'text', 'html'],
    testEnvironment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    transform: {
        '^.+\\.js$': 'babel-jest'
    }
};
