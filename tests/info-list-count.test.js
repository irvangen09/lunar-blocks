/* global describe, test, expect */
/**
 * The count text of an Info List requirements section.
 */
const fs = require( 'fs' );
const path = require( 'path' );
const {
	getCountText,
} = require( '../src/info-list/requirements/use-count-sync' );

// The file that carries the strings of build/info-list/index.js.
const TRANSLATION_FILE = path.join(
	__dirname,
	'../languages/lunar-blocks-id_ID-0c44606fa4b6641f0823e105679a3636.json'
);

describe( 'Requirements count text', () => {
	test( 'does not repeat the word of the title', () => {
		expect( getCountText( 1 ) ).toBe( '1 item' );
		expect( getCountText( 2 ) ).toBe( '2 items' );
		expect( getCountText( 0 ) ).toBe( '0 items' );
	} );

	test( 'has an Indonesian translation under the same key', () => {
		const file = JSON.parse( fs.readFileSync( TRANSLATION_FILE, 'utf8' ) );
		const messages = file.locale_data.messages;

		expect( messages[ '%d item' ] ).toEqual( [ '%d item' ] );
		expect( messages ).not.toHaveProperty( [ '%d requirement' ] );
	} );
} );
