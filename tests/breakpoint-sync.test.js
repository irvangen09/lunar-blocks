/* global describe, test, expect */
/**
 * The mobile breakpoint is written in three places that cannot import from
 * each other: the stylesheets, the scripts and the PHP image sizes. These tests
 * fail when one of them moves without the others.
 */
const fs = require( 'fs' );
const path = require( 'path' );

const { MOBILE_BREAKPOINT } = require( '../src/shared/breakpoint' );

function read( file ) {
	return fs.readFileSync( path.join( __dirname, '..', file ), 'utf8' );
}

function listFiles( dir, extension ) {
	return fs
		.readdirSync( path.join( __dirname, '..', dir ), {
			withFileTypes: true,
		} )
		.flatMap( ( entry ) => {
			const relative = path.join( dir, entry.name );

			if ( entry.isDirectory() ) {
				return listFiles( relative, extension );
			}

			return relative.endsWith( extension ) ? [ relative ] : [];
		} );
}

describe( 'mobile breakpoint', () => {
	test( 'the scripts match the Sass variable', () => {
		const match = read( 'src/shared/_breakpoints.scss' ).match(
			/\$lunar-breakpoint-mobile:\s*(\d+)px/
		);

		expect( match ).not.toBeNull();
		expect( MOBILE_BREAKPOINT ).toBe( Number( match[ 1 ] ) );
	} );

	test( 'the PHP image sizes match the Sass variable', () => {
		const sass = read( 'src/shared/_breakpoints.scss' ).match(
			/\$lunar-breakpoint-mobile:\s*(\d+)px/
		);
		const php = read( 'includes/Blocks/ImageSizes.php' ).match(
			/const MOBILE_BREAKPOINT\s*=\s*(\d+);/
		);

		expect( php ).not.toBeNull();
		expect( Number( php[ 1 ] ) ).toBe( Number( sass[ 1 ] ) );
	} );

	test( 'no stylesheet writes the breakpoint as a plain number', () => {
		const literal = new RegExp( `\\b${ MOBILE_BREAKPOINT }px\\b` );
		const offenders = listFiles( 'src', '.scss' ).filter(
			( file ) =>
				! file.endsWith( '_breakpoints.scss' ) &&
				literal.test( read( file ) )
		);

		expect( offenders ).toEqual( [] );
	} );
} );
