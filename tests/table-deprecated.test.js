/* global describe, test, expect */
/**
 * Tables saved before sorting reached the card layouts.
 *
 * Their markup is no longer what save() writes. These tests show that such
 * content is still read as valid, keeps its data, and does not start to
 * sort when it is opened.
 */
const {
	createBlock,
	parse,
	registerBlockType,
	serialize,
	setCategories,
	unregisterBlockType,
} = require( '@wordpress/blocks' );

const metadata = require( '../src/table/block.json' );
const currentSave = require( '../src/table/save' ).default;
const legacySave = require( '../src/table/deprecated/save-v1' ).default;
const saveV2 = require( '../src/table/deprecated/save-v2' ).default;
const deprecated = require( '../src/table/deprecated' ).default;

const columns = [
	{ key: 'col_a', label: 'Name', type: 'text' },
	{ key: 'col_b', label: 'Source', type: 'text' },
	{ key: 'col_c', label: 'Price', type: 'number' },
];

const rows = [
	{ id: 'row_1', isDivider: false, col_a: 'Egg', col_b: 'TV', col_c: '10' },
	{ id: 'row_2', isDivider: true, dividerLabel: 'Part two' },
	{ id: 'row_3', isDivider: false, col_a: 'Fish', col_b: 'Anna', col_c: '2' },
];

function register( save, extra = {} ) {
	if ( require( '@wordpress/blocks' ).getBlockType( metadata.name ) ) {
		unregisterBlockType( metadata.name );
	}

	registerBlockType( metadata, { edit: () => null, save, ...extra } );
}

// The markup the plugin wrote before this change.
function legacyMarkup( attributes ) {
	setCategories( [ { slug: 'lunar-blocks', title: 'Lunar Blocks' } ] );
	register( legacySave );

	return serialize( createBlock( metadata.name, attributes ) );
}

// The block comment gains the migrated attribute; the HTML must not change.
function withoutComments( markup ) {
	return markup.replace( /<!--[\s\S]*?-->/g, '' );
}

describe( 'table saved before card layouts could sort', () => {
	test.each( [ 'preset-2', 'preset-3', 'preset-4' ] )(
		'%s is valid, keeps its data, and stays unsortable',
		( preset ) => {
			const markup = legacyMarkup( { preset, columns, rows } );

			expect( markup ).toContain( 'data-sort="false"' );

			register( currentSave, { deprecated } );

			const [ block ] = parse( markup );

			expect( block.isValid ).toBe( true );
			expect( block.attributes.enableSort ).toBe( false );
			expect( block.attributes.columns ).toEqual( columns );
			expect( block.attributes.rows ).toEqual( rows );

			// WordPress reports every block it updates this way.
			expect( console ).toHaveInformed();

			// Saved again, the HTML is the same as before; only the block
			// comment now records that sorting is off.
			expect( withoutComments( serialize( block ) ) ).toBe(
				withoutComments( markup )
			);
			expect( serialize( block ) ).toContain( '"enableSort":false' );
		}
	);

	test.each( [ 'default' ] )(
		'%s needs no migration and keeps sorting on',
		( preset ) => {
			const markup = legacyMarkup( { preset, columns, rows } );

			register( currentSave, { deprecated } );

			const [ block ] = parse( markup );

			expect( block.isValid ).toBe( true );
			expect( block.attributes.enableSort ).toBe( true );
			expect( serialize( block ) ).toBe( markup );
		}
	);

	test( 'a card layout that sorts carries its columns and keyed values', () => {
		register( currentSave, { deprecated } );

		const markup = serialize(
			createBlock( metadata.name, {
				preset: 'preset-4',
				columns,
				rows,
				enableSort: true,
			} )
		);

		expect( markup ).toContain( 'data-sort="true"' );
		expect( markup ).toContain( 'data-columns=' );
		expect( markup ).toContain( 'data-key="col_b"' );
		expect( markup ).not.toContain( 'data-key="col_x"' );
	} );
} );

// The markup written up to 2.1.1, from before a Preset 1 header followed its
// column.
function markupV2( attributes ) {
	setCategories( [ { slug: 'lunar-blocks', title: 'Lunar Blocks' } ] );
	register( saveV2 );

	return serialize( createBlock( metadata.name, attributes ) );
}

describe( 'table saved before a Preset 1 header followed its column', () => {
	test( 'a Preset 1 header without an alignment was centered', () => {
		const markup = markupV2( { preset: 'preset-1', columns, rows } );

		expect( markup ).toContain( 'style="text-align:center"' );
	} );

	test( 'is valid, keeps its data, and its header now follows the body', () => {
		const markup = markupV2( { preset: 'preset-1', columns, rows } );

		register( currentSave, { deprecated } );

		const [ block ] = parse( markup );

		expect( block.isValid ).toBe( true );
		expect( block.attributes.columns ).toEqual( columns );
		expect( block.attributes.rows ).toEqual( rows );
		expect( block.attributes.mobileTable ).toBe( false );
		expect( console ).toHaveInformed();

		const saved = serialize( block );

		expect( saved ).not.toContain( 'text-align' );
		expect( saved ).not.toContain( 'data-mobile' );
	} );

	test( 'a header whose column has an alignment keeps it', () => {
		const aligned = columns.map( ( col ) => ( {
			...col,
			align: 'right',
		} ) );
		const markup = markupV2( {
			preset: 'preset-1',
			columns: aligned,
			rows,
		} );

		register( currentSave, { deprecated } );

		const [ block ] = parse( markup );

		expect( block.isValid ).toBe( true );
		expect( withoutComments( serialize( block ) ) ).toBe(
			withoutComments( markup )
		);
	} );

	test.each( [ 'default', 'preset-2', 'preset-3', 'preset-4' ] )(
		'%s is written as it was, so nothing needs migrating',
		( preset ) => {
			const markup = markupV2( { preset, columns, rows } );

			register( currentSave, { deprecated } );

			const [ block ] = parse( markup );

			expect( block.isValid ).toBe( true );
			expect( serialize( block ) ).toBe( markup );
		}
	);
} );

describe( 'Preset 1 on small screens', () => {
	function save( attributes ) {
		setCategories( [ { slug: 'lunar-blocks', title: 'Lunar Blocks' } ] );
		register( currentSave, { deprecated } );

		return serialize( createBlock( metadata.name, attributes ) );
	}

	test( 'is not marked unless the table layout is kept', () => {
		const attributes = { preset: 'preset-1', columns, rows };

		expect( save( attributes ) ).not.toContain( 'data-mobile' );
		expect( save( { ...attributes, mobileTable: false } ) ).toBe(
			save( attributes )
		);
		expect( save( { ...attributes, mobileTable: true } ) ).toContain(
			'data-mobile="table"'
		);
	} );

	test.each( [ 'default', 'preset-2', 'preset-3', 'preset-4' ] )(
		'%s ignores the option',
		( preset ) => {
			const attributes = { preset, columns, rows };

			expect(
				save( { ...attributes, mobileTable: true } )
			).not.toContain( 'data-mobile' );
		}
	);

	test( 'a block that never had the option is valid and stays off', () => {
		const markup = save( { preset: 'preset-1', columns, rows } );

		const [ block ] = parse( markup );

		expect( block.isValid ).toBe( true );
		expect( block.attributes.mobileTable ).toBe( false );
		expect( serialize( block ) ).toBe( markup );
	} );

	test( 'the option survives a round trip', () => {
		const markup = save( {
			preset: 'preset-1',
			columns,
			rows,
			mobileTable: true,
		} );

		const [ block ] = parse( markup );

		expect( block.isValid ).toBe( true );
		expect( block.attributes.mobileTable ).toBe( true );
		expect( serialize( block ) ).toBe( markup );
	} );
} );
