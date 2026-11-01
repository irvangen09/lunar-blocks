// Fewer headings than this and the front end shows nothing. Keep in sync
// with Toc::MIN_ENTRIES in PHP.
export const MIN_ENTRIES = 2;

// Blocks whose headings never reach the TOC.
const SKIPPED_BLOCKS = [ 'lunar-blocks/infobox' ];

function toPlainText( html ) {
	const doc = new window.DOMParser().parseFromString(
		String( html ?? '' ),
		'text/html'
	);

	return ( doc.body.textContent || '' ).replace( /\s+/g, ' ' ).trim();
}

// Mirrors HeadingCollector::describe() in PHP.
function describe( block ) {
	let level;
	let text;

	if ( 'core/heading' === block.name ) {
		level = Number( block.attributes.level ?? 2 );
		text = toPlainText( block.attributes.content );
	} else if ( 'lunar-blocks/accordion-item' === block.name ) {
		const match = /^h([2-6])$/.exec(
			block.attributes.headingLevel ?? 'h3'
		);

		if ( ! match ) {
			return null;
		}

		level = Number( match[ 1 ] );
		text = toPlainText( block.attributes.title );
	} else {
		return null;
	}

	return level >= 2 && level <= 6 && text ? { level, text } : null;
}

export function collect( blocks, entries = [] ) {
	blocks.forEach( ( block ) => {
		if ( SKIPPED_BLOCKS.includes( block.name ) ) {
			return;
		}

		const entry = describe( block );

		if ( entry ) {
			entries.push( entry );
		}

		collect( block.innerBlocks, entries );
	} );

	return entries;
}

// Mirrors TocRenderer::build_tree() in PHP.
export function buildTree( entries ) {
	const root = [];
	const stack = [];

	entries.forEach( ( entry ) => {
		const node = { entry, children: [] };

		while (
			stack.length &&
			stack[ stack.length - 1 ].entry.level >= entry.level
		) {
			stack.pop();
		}

		if ( stack.length ) {
			stack[ stack.length - 1 ].children.push( node );
		} else {
			root.push( node );
		}

		stack.push( node );
	} );

	return root;
}
