/* global describe, test, expect */
/**
 * Saved markup of every block.
 *
 * The markup written by save() is stored in posts, so a change to it breaks
 * content that is already saved. These tests make such a change visible:
 * the snapshot fails, and the snapshot is only updated on purpose.
 */
const fs = require( 'fs' );
const path = require( 'path' );
const {
	createBlock,
	parse,
	registerBlockType,
	serialize,
	setCategories,
} = require( '@wordpress/blocks' );

const SRC = path.resolve( __dirname, '../src' );

// WordPress removes every other tag from content saved by users who may not
// post unfiltered HTML, which makes the block invalid when it is opened.
const ALLOWED_TAGS = [
	'a',
	'article',
	'aside',
	'b',
	'blockquote',
	'br',
	'button',
	'code',
	'dd',
	'details',
	'div',
	'dl',
	'dt',
	'em',
	'figcaption',
	'figure',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'hr',
	'i',
	'img',
	'li',
	'nav',
	'ol',
	'p',
	'pre',
	'section',
	'span',
	'strong',
	'summary',
	'table',
	'tbody',
	'td',
	'th',
	'thead',
	'tr',
	'ul',
];

function findBlockDirectories( directory ) {
	return fs
		.readdirSync( directory, { withFileTypes: true } )
		.flatMap( ( entry ) => {
			const full = path.join( directory, entry.name );

			if ( entry.isDirectory() ) {
				return findBlockDirectories( full );
			}

			return 'block.json' === entry.name ? [ directory ] : [];
		} );
}

function registerAllBlocks() {
	const names = [];

	setCategories( [ { slug: 'moon-blocks', title: 'Moon Blocks' } ] );

	findBlockDirectories( SRC ).forEach( ( directory ) => {
		const metadata = require( path.join( directory, 'block.json' ) );
		const savePath = path.join( directory, 'save.js' );
		const save = fs.existsSync( savePath )
			? require( savePath ).default
			: () => null;

		const deprecatedPath = path.join( directory, 'deprecated.js' );
		const deprecated = fs.existsSync( deprecatedPath )
			? require( deprecatedPath ).default
			: undefined;

		registerBlockType( metadata, { edit: () => null, save, deprecated } );
		names.push( metadata.name );
	} );

	return names;
}

const image = {
	id: 12,
	url: 'https://example.com/wp-content/uploads/photo.jpg',
	alt: 'A photo',
};

const columns = [
	{ key: 'col_a', label: 'Picture', type: 'image', imageWidth: 48 },
	{ key: 'col_b', label: 'Name', type: 'text' },
	{ key: 'col_c', label: 'Price', type: 'number', align: 'right' },
	{ key: 'col_d', label: 'Note', type: 'text' },
];

const rows = [
	{
		id: 'row_1',
		isDivider: false,
		col_a: image,
		col_b: 'Turnip <strong>seeds</strong>',
		col_c: '120',
		col_d: 'Spring',
	},
	{ id: 'row_2', isDivider: true, dividerLabel: 'Summer' },
	{
		id: 'row_3',
		isDivider: false,
		col_a: { id: 0, url: image.url, alt: '' },
		col_b: 'Tomato seeds',
		col_c: '',
		col_d: '',
	},
];

// One entry per saved layout: every variant, preset and optional part.
function buildSamples() {
	const samples = {
		'accordion, open on desktop': createBlock(
			'moon-blocks/accordion',
			{ openOnDesktop: true },
			[
				createBlock( 'moon-blocks/accordion-item', {
					title: 'First',
					headingLevel: 'h3',
				} ),
				createBlock( 'moon-blocks/accordion-item', {
					title: 'Second',
					headingLevel: 'none',
				} ),
			]
		),
		'accordion, closed on desktop': createBlock(
			'moon-blocks/accordion',
			{ openOnDesktop: false },
			[
				createBlock( 'moon-blocks/accordion-item', {
					title: 'Only',
					headingLevel: 'h2',
				} ),
			]
		),
		'callout without label': createBlock( 'moon-blocks/callout', {
			variant: 'info',
			content: 'Body',
			label: '',
			variantName: 'Info',
		} ),
		'gallery, 3 columns': createBlock(
			'moon-blocks/gallery',
			{ columns: 3 },
			[
				createBlock( 'moon-blocks/gallery-item', {
					imageId: 12,
					imageUrl: image.url,
					imageAlt: 'A photo',
					caption: 'Caption',
				} ),
				createBlock( 'moon-blocks/gallery-item', {
					imageId: 0,
					imageUrl: image.url,
					imageAlt: '',
				} ),
			]
		),
		'info list': createBlock( 'moon-blocks/info-list', {}, [
			createBlock( 'moon-blocks/info-list-item', {
				icon: 'dashicons-calendar',
				label: 'Season',
				value: 'Spring',
			} ),
			createBlock(
				'moon-blocks/info-list-requirements',
				{ title: 'Needs' },
				[
					createBlock( 'moon-blocks/info-list-requirement', {
						icon: 'dashicons-yes',
						text: 'Hoe',
					} ),
				]
			),
		] ),
		'info list, no count': createBlock( 'moon-blocks/info-list', {}, [
			createBlock(
				'moon-blocks/info-list-requirements',
				{ title: 'Needs', showCount: false, countText: '' },
				[
					createBlock( 'moon-blocks/info-list-requirement', {
						text: 'Water',
					} ),
				]
			),
		] ),
		'infobox with image': createBlock(
			'moon-blocks/infobox',
			{
				title: 'Character',
				headingLevel: 'h2',
				imageId: 12,
				imageUrl: image.url,
				imageAlt: 'Portrait',
			},
			[
				createBlock( 'moon-blocks/infobox-item', {
					icon: 'dashicons-heart',
					label: 'Birthday',
					value: 'Spring 4',
				} ),
			]
		),
		'infobox without image': createBlock(
			'moon-blocks/infobox',
			{ title: 'Place', headingLevel: 'none' },
			[
				createBlock( 'moon-blocks/infobox-item', {
					label: 'Region',
					value: 'North',
				} ),
			]
		),
		tabs: createBlock( 'moon-blocks/tabs', {}, [
			createBlock( 'moon-blocks/tabs-item', { label: 'One' } ),
			createBlock( 'moon-blocks/tabs-item', { label: 'Two' } ),
		] ),
		'table of contents': createBlock( 'moon-blocks/toc', {
			title: 'Contents',
		} ),
	};

	[ 'info', 'tips', 'warning', 'important' ].forEach( ( variant ) => {
		samples[ `callout, ${ variant }` ] = createBlock(
			'moon-blocks/callout',
			{
				variant,
				content: 'Body',
				label: variant,
				variantName: variant,
			}
		);
	} );

	[ 'default', 'preset-1', 'preset-2', 'preset-3', 'preset-4' ].forEach(
		( preset ) => {
			samples[ `table, ${ preset }` ] = createBlock(
				'moon-blocks/table',
				{
					preset,
					columns,
					rows,
					showCardNote: true,
					showCardHighlight: true,
				}
			);
		}
	);

	// Recipe cards read their roles from the column types: chips, a price chip
	// and labeled fields, with one blank value that is left out.
	const recipeColumns = [
		{ key: 'col_a', label: 'Picture', type: 'image', imageWidth: 48 },
		{ key: 'col_b', label: 'Name', type: 'text' },
		{ key: 'col_c', label: 'Stats', type: 'text' },
		{ key: 'col_d', label: 'Price', type: 'number' },
		{ key: 'col_e', label: 'Level', type: 'text' },
		{ key: 'col_f', label: 'Photo', type: 'image', imageWidth: 32 },
		{ key: 'col_g', label: 'Tools', type: 'text' },
	];
	const recipeRows = [
		{
			id: 'row_1',
			isDivider: false,
			col_a: image,
			col_b: 'Mayonnaise',
			col_c: 'Easy, Quick',
			col_d: '230',
			col_e: '<em>Chef</em> 4',
			col_f: image,
			col_g: 'Whisk',
		},
		{ id: 'row_2', isDivider: true, dividerLabel: 'Sauces' },
		{
			id: 'row_3',
			isDivider: false,
			col_a: { id: 0, url: image.url, alt: '' },
			col_b: 'Plain',
			col_c: '',
			col_d: '',
			col_e: '',
			col_f: null,
			col_g: 'N/A',
		},
	];

	[ 'preset-3', 'preset-4' ].forEach( ( preset ) => {
		samples[ `table, ${ preset } with fields` ] = createBlock(
			'moon-blocks/table',
			{ preset, columns: recipeColumns, rows: recipeRows }
		);
	} );

	// A card layout with sorting off is saved exactly as before sorting
	// reached the card layouts.
	[ 'preset-2', 'preset-3' ].forEach( ( preset ) => {
		samples[ `table, ${ preset }, sort off` ] = createBlock(
			'moon-blocks/table',
			{ preset, columns, rows, enableSort: false }
		);
	} );

	samples[ 'table, sort and filter off' ] = createBlock(
		'moon-blocks/table',
		{
			preset: 'default',
			columns,
			rows,
			enableSort: false,
			enableFilter: false,
		}
	);

	return samples;
}

function collectTags( markup ) {
	return [
		...new Set(
			[ ...markup.matchAll( /<([a-z][a-z0-9-]*)\b/gi ) ].map( ( match ) =>
				match[ 1 ].toLowerCase()
			)
		),
	];
}

function everyBlock( blocks, callback ) {
	blocks.forEach( ( block ) => {
		callback( block );
		everyBlock( block.innerBlocks, callback );
	} );
}

// Registered at load time because the sample list is built while the tests
// are collected, before any hook runs.
const registeredNames = registerAllBlocks();

describe( 'saved markup', () => {
	test( 'every block in src is covered by a sample', () => {
		const covered = new Set();

		Object.values( buildSamples() ).forEach( ( block ) =>
			everyBlock( [ block ], ( inner ) => covered.add( inner.name ) )
		);

		expect( [ ...covered ].sort() ).toEqual(
			[ ...registeredNames ].sort()
		);
	} );

	describe.each( Object.entries( buildSamples() ) )(
		'%s',
		( name, block ) => {
			const markup = serialize( block );

			test( 'matches the stored snapshot', () => {
				expect( markup ).toMatchSnapshot();
			} );

			test( 'is read back as valid blocks and saves the same markup', () => {
				const parsed = parse( markup );

				expect( parsed ).toHaveLength( 1 );
				everyBlock( parsed, ( inner ) =>
					expect( inner.isValid ).toBe( true )
				);
				expect( serialize( parsed ) ).toBe( markup );
			} );

			test( 'uses only tags that survive content filtering', () => {
				const body = markup.replace( /<!--[\s\S]*?-->/g, '' );

				expect(
					collectTags( body ).filter(
						( tag ) => ! ALLOWED_TAGS.includes( tag )
					)
				).toEqual( [] );
			} );
		}
	);
} );
