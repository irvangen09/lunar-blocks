/**
 * `wp-scripts plugin-zip`, when package.json has a "files" field,
 * builds the archive through npm's own packaging rules — which force
 * certain metadata files (package.json, LICENSE.md, README.md, and
 * similar) into the package regardless of what "files" lists. This
 * script removes them from the finished zip afterward.
 *
 * @package Lunar\Blocks
 */

const AdmZip = require( 'adm-zip' );
const { name } = require( '../package.json' );

const zipPath = `./${ name }.zip`;
const zip = new AdmZip( zipPath );

const unwanted = [ 'package.json', 'LICENSE.md', 'README.md', 'CHANGELOG.md' ];

unwanted.forEach( ( file ) => {
	const entry = `${ name }/${ file }`;

	if ( zip.getEntry( entry ) ) {
		zip.deleteFile( entry );
		process.stdout.write( `  Removed \`${ file }\` from the package.\n` );
	}
} );

zip.writeZip( zipPath );