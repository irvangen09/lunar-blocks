/* global describe, test, expect */
/**
 * The TOC decides in two places which headings count: PHP on the front end and
 * JavaScript in the editor preview. They cannot share code, so these tests read
 * the PHP rules from the source and check that the JavaScript follows them.
 */
const fs = require( 'fs' );
const path = require( 'path' );

const { MIN_ENTRIES, collect } = require( '../src/toc/headings' );

function read( file ) {
	return fs.readFileSync( path.join( __dirname, '..', file ), 'utf8' );
}

const COLLECTOR = read( 'includes/Blocks/Toc/HeadingCollector.php' );

function heading( level, content ) {
	return {
		name: 'core/heading',
		attributes: { level, content },
		innerBlocks: [],
	};
}

function accordionItem( title, headingLevel ) {
	return {
		name: 'lunar-blocks/accordion-item',
		attributes: { title, headingLevel },
		innerBlocks: [],
	};
}

function phpSkippedBlocks() {
	const match = COLLECTOR.match(
		/const SKIPPED_BLOCKS\s*=\s*array\(([^)]*)\)/
	);

	expect( match ).not.toBeNull();

	return [ ...match[ 1 ].matchAll( /'([^']+)'/g ) ].map( ( m ) => m[ 1 ] );
}

describe( 'TOC rules in PHP and JavaScript', () => {
	test( 'both need the same number of headings', () => {
		const match = read( 'includes/Blocks/Toc/Toc.php' ).match(
			/const MIN_ENTRIES\s*=\s*(\d+);/
		);

		expect( match ).not.toBeNull();
		expect( MIN_ENTRIES ).toBe( Number( match[ 1 ] ) );
	} );

	test( 'the PHP classes read the minimum from Toc, not a copy', () => {
		[
			'includes/Blocks/Toc/HeadingAnchorInjector.php',
			'includes/Blocks/Toc/TocRenderer.php',
		].forEach( ( file ) => {
			expect( read( file ) ).toContain( 'Toc::MIN_ENTRIES' );
		} );
	} );

	test( 'both skip the same blocks', () => {
		const skipped = phpSkippedBlocks();

		expect( skipped.length ).toBeGreaterThan( 0 );

		skipped.forEach( ( name ) => {
			const inside = {
				name,
				attributes: {},
				innerBlocks: [ heading( 2, 'Hidden' ) ],
			};

			expect( collect( [ inside ] ) ).toEqual( [] );
		} );

		// A block that is not on the list still lets its headings through.
		const other = {
			name: 'core/group',
			attributes: {},
			innerBlocks: [ heading( 2, 'Shown' ) ],
		};

		expect( collect( [ other ] ) ).toEqual( [
			{ level: 2, text: 'Shown' },
		] );
	} );

	test( 'both count core headings and Accordion titles', () => {
		expect( COLLECTOR ).toContain( "'core/heading' === $name" );
		expect( COLLECTOR ).toContain(
			"'lunar-blocks/accordion-item' === $name"
		);

		expect( collect( [ heading( 3, 'A' ) ] ) ).toHaveLength( 1 );
		expect( collect( [ accordionItem( 'B', 'h3' ) ] ) ).toHaveLength( 1 );
	} );

	test( 'both take levels 2 to 6 for an Accordion title', () => {
		// The pattern PHP uses for the level of an Accordion title.
		expect( COLLECTOR ).toContain( "'/^h([2-6])$/'" );

		[ 'h2', 'h3', 'h4', 'h5', 'h6' ].forEach( ( tag ) => {
			expect( collect( [ accordionItem( 'Title', tag ) ] ) ).toEqual( [
				{ level: Number( tag[ 1 ] ), text: 'Title' },
			] );
		} );

		[ 'h1', 'h7', 'none', 'span' ].forEach( ( tag ) => {
			expect( collect( [ accordionItem( 'Title', tag ) ] ) ).toEqual(
				[]
			);
		} );
	} );

	test( 'both take levels 2 to 6 for a core heading', () => {
		expect( COLLECTOR ).toContain( '$level < 2 || $level > 6' );

		expect(
			collect( [ 1, 2, 6, 7 ].map( ( level ) => heading( level, 'H' ) ) )
		).toEqual( [
			{ level: 2, text: 'H' },
			{ level: 6, text: 'H' },
		] );
	} );

	test( 'both default to level 2 for a heading and h3 for an Accordion', () => {
		expect( COLLECTOR ).toContain( "$block['attrs']['level'] ?? 2" );
		expect( COLLECTOR ).toContain(
			"$block['attrs']['headingLevel'] ?? 'h3'"
		);

		expect( collect( [ heading( undefined, 'Plain' ) ] ) ).toEqual( [
			{ level: 2, text: 'Plain' },
		] );
		expect( collect( [ accordionItem( 'Item', undefined ) ] ) ).toEqual( [
			{ level: 3, text: 'Item' },
		] );
	} );

	test( 'both leave out a heading without text', () => {
		expect( COLLECTOR ).toContain( "'' === $text" );
		expect( collect( [ heading( 2, '  <em></em> ' ) ] ) ).toEqual( [] );
	} );
} );
