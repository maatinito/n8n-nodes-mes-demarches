module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: [
		'**/__tests__/**/*.ts',
		'**/tests/**/*.test.ts',
		'**/?(*.)+(spec|test).ts'
	],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	collectCoverageFrom: [
		'nodes/**/*.ts',
		'credentials/**/*.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/dist/**'
	],
	moduleFileExtensions: ['ts', 'js', 'json'],
	testPathIgnorePatterns: [
		'/node_modules/',
		'/dist/'
	],
	modulePathIgnorePatterns: [
		'<rootDir>/dist/'
	],
	setupFilesAfterEnv: [],
	verbose: true
};