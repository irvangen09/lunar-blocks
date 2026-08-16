/**
 * Dart Sass emits a UTF-8 BOM (or `@charset "UTF-8";`, which the CSS
 * minifier in this build pipeline converts into a raw BOM) whenever a
 * stylesheet's source — including comments that get stripped from the
 * final output — contains a non-ASCII character. A few of the plugin's
 * stylesheets currently end up with a leading BOM in their compiled
 * output; not every browser/proxy skips it reliably when parsing CSS,
 * which can corrupt the first rule in the file. This strips any
 * leading BOM from every compiled CSS file after each build.
 *
 * @package Lunar\Blocks
 */

const fs = require( 'fs' );
const path = require( 'path' );

const BOM = Buffer.from( [ 0xef, 0xbb, 0xbf ] );
const buildDir = path.resolve( __dirname, '../build' );

function findCssFiles( dir ) {
	let results = [];
	const entries = fs.readdirSync( dir, { withFileTypes: true } );

	for ( const entry of entries ) {
		const fullPath = path.join( dir, entry.name );

		if ( entry.isDirectory() ) {
			results = results.concat( findCssFiles( fullPath ) );
		} else if ( entry.isFile() && entry.name.endsWith( '.css' ) ) {
			results.push( fullPath );
		}
	}

	return results;
}

if ( ! fs.existsSync( buildDir ) ) {
	process.exit( 0 );
}

const cssFiles = findCssFiles( buildDir );
let strippedCount = 0;

cssFiles.forEach( ( filePath ) => {
	const content = fs.readFileSync( filePath );

	if ( content.subarray( 0, 3 ).equals( BOM ) ) {
		fs.writeFileSync( filePath, content.subarray( 3 ) );
		strippedCount++;
		process.stdout.write(
			`  Stripped BOM from \`${ path.relative( buildDir, filePath ) }\`.\n`
		);
	}
} );

if ( strippedCount === 0 ) {
	process.stdout.write( '  No BOM found in compiled CSS.\n' );
}