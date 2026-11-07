/* global describe, test, expect */
/**
 * A release number is written in many files, and a release that misses one
 * ships with the wrong number (WordPress reads the plugin header, the update
 * check reads the readme). These tests fail when the files disagree.
 */
const fs = require( 'fs' );
const path = require( 'path' );

function read( file ) {
	return fs.readFileSync( path.join( __dirname, '..', file ), 'utf8' );
}

function first( text, pattern, label ) {
	const match = text.match( pattern );

	if ( ! match ) {
		throw new Error( `Could not find ${ label }.` );
	}

	return match[ 1 ];
}

const PLUGIN = read( 'lunar-blocks.php' );
const README = read( 'readme.txt' );
const CHANGELOG = read( 'CHANGELOG.md' );
const PACKAGE = JSON.parse( read( 'package.json' ) );
const LOCK = JSON.parse( read( 'package-lock.json' ) );
const COMPOSER = JSON.parse( read( 'composer.json' ) );

const VERSION = first(
	PLUGIN,
	/^\s*\*\s*Version:\s*(\S+)/m,
	'the Version line in the plugin header'
);

describe( 'release number', () => {
	test( 'is a plain version number', () => {
		expect( VERSION ).toMatch( /^\d+\.\d+\.\d+$/ );
	} );

	test( 'is the same in the plugin constant', () => {
		expect(
			first(
				PLUGIN,
				/define\(\s*'LUNAR_BLOCKS_VERSION',\s*'([^']+)'/,
				'LUNAR_BLOCKS_VERSION'
			)
		).toBe( VERSION );
	} );

	test( 'is the same in package.json and package-lock.json', () => {
		expect( PACKAGE.version ).toBe( VERSION );
		expect( LOCK.version ).toBe( VERSION );
		expect( LOCK.packages[ '' ].version ).toBe( VERSION );
	} );

	test( 'is the Stable tag in readme.txt', () => {
		expect( first( README, /^Stable tag:\s*(\S+)/m, 'Stable tag' ) ).toBe(
			VERSION
		);
	} );

	test( 'is the newest release in CHANGELOG.md and in readme.txt', () => {
		expect(
			first(
				CHANGELOG,
				/^## \[(\d+\.\d+\.\d+)\]/m,
				'a release heading in CHANGELOG.md'
			)
		).toBe( VERSION );
		expect(
			first(
				README.slice( README.indexOf( '== Changelog ==' ) ),
				/^= (\d+\.\d+\.\d+) =/m,
				'a release heading in the readme changelog'
			)
		).toBe( VERSION );
	} );

	test( 'is in the translation files', () => {
		[ 'lunar-blocks.pot', 'lunar-blocks-id_ID.po' ].forEach( ( file ) => {
			expect(
				first(
					read( `languages/${ file }` ),
					/"Project-Id-Version: Lunar Blocks (\S+?)\\n"/,
					`Project-Id-Version in ${ file }`
				)
			).toBe( VERSION );
		} );
	} );

	test( 'has an entry for every release, newest first', () => {
		const versions = [
			...CHANGELOG.matchAll(
				/^## \[(\d+)\.(\d+)\.(\d+)\] - \d{4}-\d{2}-\d{2}$/gm
			),
		].map( ( m ) => m.slice( 1 ).map( Number ) );

		expect( versions.length ).toBeGreaterThan( 1 );

		for ( let i = 1; i < versions.length; i++ ) {
			const [ a, b ] = [ versions[ i - 1 ], versions[ i ] ];
			const newer = a[ 0 ] - b[ 0 ] || a[ 1 ] - b[ 1 ] || a[ 2 ] - b[ 2 ];

			expect( newer ).toBeGreaterThan( 0 );
		}
	} );
} );

describe( 'minimum versions', () => {
	const header = ( label ) =>
		first(
			PLUGIN,
			new RegExp( `^\\s*\\*\\s*${ label }:\\s*(\\S+)`, 'm' ),
			label
		);

	test( 'the plugin header and the readme ask for the same PHP and WordPress', () => {
		expect(
			first( README, /^Requires PHP:\s*(\S+)/m, 'Requires PHP' )
		).toBe( header( 'Requires PHP' ) );
		expect(
			first( README, /^Requires at least:\s*(\S+)/m, 'Requires at least' )
		).toBe( header( 'Requires at least' ) );
	} );

	test( 'the runtime check and Composer ask for the same PHP and WordPress', () => {
		const php = header( 'Requires PHP' );
		const wp = header( 'Requires at least' );

		expect( COMPOSER.require.php ).toBe( `>=${ php }` );
		expect( PLUGIN ).toContain(
			`version_compare( PHP_VERSION, '${ php }', '<' )`
		);
		expect( PLUGIN ).toContain(
			`$lunar_blocks_wp_version, '${ wp }', '<' )`
		);
		expect( PLUGIN ).toContain(
			`requires PHP ${ php } or later and WordPress ${ wp } or later`
		);
	} );
} );
