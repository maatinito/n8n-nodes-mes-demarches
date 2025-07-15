module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:n8n-nodes-base/nodes',
	],
	rules: {
		'n8n-nodes-base/node-class-description-display-name-unsuffixed-trigger-node': 'off',
		'n8n-nodes-base/node-class-description-name-unsuffixed-trigger-node': 'off',
		'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
		'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
		'n8n-nodes-base/node-param-operation-option-action-miscased': 'off',
	},
	ignorePatterns: ['dist/**', 'node_modules/**'],
};