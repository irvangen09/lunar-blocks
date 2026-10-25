/* global describe, test, expect */
const {
	createBlock,
	getBlockType,
	parse,
	registerBlockType,
	serialize,
	setCategories,
	unregisterBlockType,
} = require( '@wordpress/blocks' );

const metadata = require( '../src/accordion/block.json' );
const itemMetadata = require( '../src/accordion/item/block.json' );
const currentSave = require( '../src/accordion/save' ).default;
const legacySave = require( '../src/accordion/deprecated/save-v1' ).default;
const deprecated = require( '../src/accordion/deprecated' ).default;

function register( name, config, save, extra = {} ) {
	if ( getBlockType( name ) ) {
		unregisterBlockType( name );
	}

	registerBlockType( config, { edit: () => null, save, ...extra } );
}

function registerItem() {
	register(
		itemMetadata.name,
		itemMetadata,
		require( '../src/accordion/item/save' ).default
	);
}

// The markup the plugin wrote before the default changed: the legacy block
// with its old default of true.
function legacyMarkup( openOnDesktop ) {
	setCategories( [ { slug: 'moon-blocks', title: 'Moon Blocks' } ] );
	registerItem();
	register(
		metadata.name,
		{
			...metadata,
			attributes: {
				openOnDesktop: { type: 'boolean', default: true },
			},
		},
		legacySave
	);

	return serialize(
		createBlock(
			metadata.name,
			openOnDesktop ? {} : { openOnDesktop: false },
			[
				createBlock( itemMetadata.name, {
					title: 'First',
					headingLevel: 'h3',
				} ),
			]
		)
	);
}

function registerCurrent() {
	register( metadata.name, metadata, currentSave, { deprecated } );
}

describe( 'accordion saved before the default changed', () => {
	test( 'an accordion saved with the old default is valid and stays open on desktop', () => {
		const markup = legacyMarkup( true );

		expect( markup ).toContain( 'moon-accordion--open-desktop' );
		expect( markup ).not.toContain( '"openOnDesktop"' );

		registerCurrent();

		const [ block ] = parse( markup );

		expect( block.isValid ).toBe( true );
		expect( block.attributes.openOnDesktop ).toBe( true );
		expect( block.attributes.className ).toBeUndefined();
		expect( block.innerBlocks ).toHaveLength( 1 );
		expect( block.innerBlocks[ 0 ].attributes.title.toString() ).toBe(
			'First'
		);

		// Saved again, the choice is written down and the HTML is the same.
		const saved = serialize( block );

		expect( saved ).toContain( '"openOnDesktop":true' );
		expect( saved ).toContain( 'moon-accordion--open-desktop' );
		expect( saved ).not.toContain( '"className"' );
	} );

	test( 'an accordion saved as closed on desktop is valid without migration', () => {
		const markup = legacyMarkup( false );

		expect( markup ).toContain( '"openOnDesktop":false' );
		expect( markup ).not.toContain( 'moon-accordion--open-desktop' );

		registerCurrent();

		const [ block ] = parse( markup );

		expect( block.isValid ).toBe( true );
		expect( block.attributes.openOnDesktop ).toBe( false );

		// Saved again, the default value is no longer written.
		expect( serialize( block ) ).not.toContain( '"openOnDesktop"' );
	} );
} );

describe( 'new accordion', () => {
	test( 'starts collapsed and writes no attribute', () => {
		setCategories( [ { slug: 'moon-blocks', title: 'Moon Blocks' } ] );
		registerItem();
		registerCurrent();

		const block = createBlock( metadata.name, {}, [
			createBlock( itemMetadata.name, { title: 'Only' } ),
		] );

		expect( block.attributes.openOnDesktop ).toBe( false );

		const markup = serialize( block );

		expect( markup ).not.toContain( 'moon-accordion--open-desktop' );
		expect( markup ).not.toContain( '"openOnDesktop"' );
	} );
} );
