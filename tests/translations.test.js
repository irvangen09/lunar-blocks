/* global describe, test, expect */
/**
 * The Indonesian translation lives in four kinds of file: the template
 * (.pot), the translation (.po), and the script files (.json) that the block
 * editor and the front end load. They are made from each other by tools, so
 * these tests check that they still agree after somebody changes one by hand.
 */
const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );

const LANGUAGES = path.join( __dirname, '..', 'languages' );
const CONTEXT_SEPARATOR = '\u0004';

function unquote( line ) {
	return JSON.parse( line.trim() );
}

// A small reader for the files WP-CLI writes: one entry per block of lines.
function parsePo( file ) {
	const entries = [];
	const lines = fs
		.readFileSync( path.join( LANGUAGES, file ), 'utf8' )
		.split( '\n' );
	let entry = null;
	let field = null;

	function finish() {
		if ( entry ) {
			entries.push( entry );
		}
		entry = null;
		field = null;
	}

	// Like gettext, an entry ends where the next one starts, not at a blank
	// line, so a stray blank line inside an entry does not split it.
	lines.forEach( ( line ) => {
		const starts =
			line.startsWith( '#' ) || /^(msgctxt|msgid)\s/.test( line );

		if ( '' === line.trim() ) {
			return;
		}

		if ( starts && entry && entry.msgstr.length > 0 ) {
			finish();
		}

		if ( line.startsWith( '#,' ) ) {
			entry = entry || { flags: [], msgstr: [] };
			entry.flags.push(
				...line
					.slice( 2 )
					.split( ',' )
					.map( ( f ) => f.trim() )
			);
			return;
		}

		if ( line.startsWith( '#' ) ) {
			entry = entry || { flags: [], msgstr: [] };
			return;
		}

		const keyword = line.match(
			/^(msgctxt|msgid_plural|msgid|msgstr(?:\[(\d+)\])?)\s+(".*")$/
		);

		if ( keyword ) {
			entry = entry || { flags: [], msgstr: [] };

			if ( keyword[ 1 ].startsWith( 'msgstr' ) ) {
				const index = Number( keyword[ 2 ] || 0 );

				entry.msgstr[ index ] = unquote( keyword[ 3 ] );
				field = { list: entry.msgstr, index };
			} else {
				entry[ keyword[ 1 ] ] = unquote( keyword[ 3 ] );
				field = { object: entry, name: keyword[ 1 ] };
			}
			return;
		}

		if ( line.startsWith( '"' ) && field ) {
			if ( field.list ) {
				field.list[ field.index ] += unquote( line );
			} else {
				field.object[ field.name ] += unquote( line );
			}
		}
	} );

	finish();

	return entries;
}

function header( entries ) {
	const map = {};

	entries
		.find( ( e ) => '' === e.msgid && undefined === e.msgctxt )
		.msgstr[ 0 ].split( '\n' )
		.forEach( ( line ) => {
			const at = line.indexOf( ':' );

			if ( at > 0 ) {
				map[ line.slice( 0, at ) ] = line.slice( at + 1 ).trim();
			}
		} );

	return map;
}

function key( entry ) {
	return undefined === entry.msgctxt
		? entry.msgid
		: entry.msgctxt + CONTEXT_SEPARATOR + entry.msgid;
}

function messages( entries ) {
	return entries.filter( ( e ) => '' !== e.msgid );
}

const pot = messages( parsePo( 'lunar-blocks.pot' ) );
const po = messages( parsePo( 'lunar-blocks-id_ID.po' ) );
const jsonFiles = fs
	.readdirSync( LANGUAGES )
	.filter( ( file ) => file.endsWith( '.json' ) );

describe( 'translation files', () => {
	test( 'the reader finds the entries', () => {
		expect( pot.length ).toBeGreaterThan( 100 );
		expect( jsonFiles.length ).toBeGreaterThan( 0 );
	} );

	test( 'the translation has every string of the template, and no other', () => {
		const potKeys = pot.map( key ).sort();
		const poKeys = po.map( key ).sort();

		expect( poKeys ).toEqual( potKeys );
	} );

	test( 'no string appears twice', () => {
		expect( new Set( po.map( key ) ).size ).toBe( po.length );
	} );

	test( 'every string is translated and none is marked fuzzy', () => {
		const untranslated = po
			.filter(
				( e ) =>
					e.flags.includes( 'fuzzy' ) ||
					0 === e.msgstr.length ||
					e.msgstr.some( ( s ) => ! s )
			)
			.map( key );

		expect( untranslated ).toEqual( [] );
	} );

	test( 'a string with placeholders keeps them in the translation', () => {
		const placeholders = ( text ) =>
			( text.match( /%(?:\d+\$)?[sd]/g ) || [] ).sort();
		const broken = po
			.filter( ( e ) =>
				e.msgstr.some(
					( s ) =>
						JSON.stringify( placeholders( s ) ) !==
						JSON.stringify( placeholders( e.msgid ) )
				)
			)
			.map( key );

		expect( broken ).toEqual( [] );
	} );

	test( 'the template and the translation describe the same version', () => {
		const potHeader = header( parsePo( 'lunar-blocks.pot' ) );
		const poHeader = header( parsePo( 'lunar-blocks-id_ID.po' ) );

		expect( poHeader[ 'Project-Id-Version' ] ).toBe(
			potHeader[ 'Project-Id-Version' ]
		);
		expect( poHeader[ 'X-Domain' ] ).toBe( 'lunar-blocks' );
		expect( poHeader.Language ).toBe( 'id_ID' );
	} );

	describe.each( jsonFiles )( '%s', ( file ) => {
		const data = JSON.parse(
			fs.readFileSync( path.join( LANGUAGES, file ), 'utf8' )
		);
		const poByKey = new Map( po.map( ( e ) => [ key( e ), e ] ) );

		test( 'is named after the script it translates', () => {
			const hash = crypto
				.createHash( 'md5' )
				.update( data.source )
				.digest( 'hex' );

			expect( file ).toBe( `lunar-blocks-id_ID-${ hash }.json` );
		} );

		test( 'belongs to a script that still exists in src', () => {
			expect( data.source.startsWith( 'build/' ) ).toBe( true );
			expect(
				fs.existsSync(
					path.join( __dirname, '..', 'src', data.source.slice( 6 ) )
				)
			).toBe( true );
		} );

		test( 'carries the language and the revision date of the translation', () => {
			const poHeader = header( parsePo( 'lunar-blocks-id_ID.po' ) );

			expect( data[ 'translation-revision-date' ] ).toBe(
				poHeader[ 'PO-Revision-Date' ]
			);
			expect( data.locale_data.messages[ '' ].lang ).toBe( 'id_ID' );
		} );

		test( 'every string matches the translation file', () => {
			const mismatches = Object.entries( data.locale_data.messages )
				.filter( ( [ id ] ) => '' !== id )
				.filter( ( [ id, translated ] ) => {
					const entry = poByKey.get( id );

					return (
						! entry ||
						JSON.stringify( entry.msgstr ) !==
							JSON.stringify( translated )
					);
				} )
				.map( ( [ id ] ) => id );

			expect( mismatches ).toEqual( [] );
		} );
	} );
} );
