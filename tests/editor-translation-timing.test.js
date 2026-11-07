/* global describe, test, expect, jest */
/**
 * The Table editor must not translate text while its files load. Translations
 * are registered by WordPress before the block runs, but a string read at load
 * time is fixed for good, so every string is read when it is drawn.
 */
const mockTranslate = jest.fn( ( text ) => text );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( ...args ) => mockTranslate( ...args ),
} ) );

// The editor components are not needed to load these files.
jest.mock( '@wordpress/block-editor', () => ( {} ) );
jest.mock( '@wordpress/components', () => ( {} ) );

describe( 'the Table editor files', () => {
	test.each( [
		[ 'the toolbar', '../src/table/table-toolbar' ],
		[ 'the settings panel', '../src/table/editor/settings-panel' ],
	] )( '%s read no translation when they are loaded', ( name, file ) => {
		mockTranslate.mockClear();

		jest.isolateModules( () => {
			require( file );
		} );

		expect( mockTranslate ).not.toHaveBeenCalled();
	} );
} );
