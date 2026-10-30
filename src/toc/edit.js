import { __ } from '@wordpress/i18n';
import { PlainText, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

// Fewer headings than this and the front end shows nothing. Keep in sync
// with Toc::MIN_ENTRIES in PHP.
const MIN_ENTRIES = 2;

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

function collect( blocks, entries = [] ) {
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
function buildTree( entries ) {
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

function List( { nodes, depth = 0 } ) {
	return (
		<ul
			className={
				'lunar-toc__list' + ( depth > 0 ? ' lunar-toc__list--sub' : '' )
			}
		>
			{ nodes.map( ( node, index ) => (
				<li className="lunar-toc__item" key={ index }>
					<span className="lunar-toc__link">
						<span
							className="lunar-toc__marker"
							aria-hidden="true"
						/>
						<span className="lunar-toc__text">
							{ node.entry.text }
						</span>
					</span>
					{ node.children.length > 0 && (
						<List nodes={ node.children } depth={ depth + 1 } />
					) }
				</li>
			) ) }
		</ul>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { title } = attributes;
	const blockProps = useBlockProps( { className: 'lunar-toc' } );

	const blocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks(),
		[]
	);
	const entries = collect( blocks );

	return (
		<div { ...blockProps }>
			<div className="lunar-toc__header">
				<PlainText
					className="lunar-toc__title"
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					onKeyDown={ ( event ) => {
						if ( 'Enter' === event.key ) {
							event.preventDefault();
						}
					} }
					placeholder={ __( 'Table of contents', 'lunar-blocks' ) }
					aria-label={ __( 'Title', 'lunar-blocks' ) }
				/>
			</div>
			{ entries.length >= MIN_ENTRIES ? (
				<nav className="lunar-toc__nav">
					<List nodes={ buildTree( entries ) } />
				</nav>
			) : (
				<p className="lunar-toc__notice">
					{ __(
						'The table of contents appears on the page once it has at least two headings.',
						'lunar-blocks'
					) }
				</p>
			) }
		</div>
	);
}
