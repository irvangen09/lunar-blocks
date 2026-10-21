module.exports = {
	preset: '@wordpress/jest-preset-default',
	testMatch: [ '<rootDir>/tests/**/*.test.js' ],
	transform: {
		'\\.m?[jt]sx?$': [
			'babel-jest',
			{ presets: [ '@wordpress/babel-preset-default' ] },
		],
	},
	// Several WordPress packages ship ES modules only.
	transformIgnorePatterns: [ '\\.cjs$' ],
	// A second copy of a package breaks shared state, such as the block store
	// and the raw HTML marker, so each resolves to the top-level copy.
	moduleNameMapper: {
		'^@wordpress/(element|blocks|data|block-editor|components|i18n)$':
			'<rootDir>/node_modules/@wordpress/$1',
	},
};
