/* global describe, test, expect */
/**
 * Collecting headings for the editor preview of the TOC.
 */
const { MIN_ENTRIES, buildTree, collect } = require( '../src/toc/headings' );

function heading( level, content ) {
	return {
		name: 'core/heading',
		attributes: { level, content },
		innerBlocks: [],
	};
}

function accordionItem( title, headingLevel, innerBlocks = [] ) {
	return {
		name: 'lunar-blocks/accordion-item',
		attributes: { title, headingLevel },
		innerBlocks,
	};
}

function group( innerBlocks ) {
	return { name: 'core/group', attributes: {}, innerBlocks };
}

describe( 'TOC headings', () => {
	test( 'shows nothing below two headings, as on the front end', () => {
		expect( MIN_ENTRIES ).toBe( 2 );
	} );

	test( 'collects core headings from level 2 to 6', () => {
		const blocks = [
			heading( 1, 'One' ),
			heading( 2, 'Two' ),
			heading( 6, 'Six' ),
			heading( 7, 'Seven' ),
		];

		expect( collect( blocks ) ).toEqual( [
			{ level: 2, text: 'Two' },
			{ level: 6, text: 'Six' },
		] );
	} );

	test( 'a heading without a level counts as level 2', () => {
		expect( collect( [ heading( undefined, 'Plain' ) ] ) ).toEqual( [
			{ level: 2, text: 'Plain' },
		] );
	} );

	test( 'reads plain text from markup and collapses white space', () => {
		const blocks = [
			heading( 2, '<strong>Bold</strong>  and\n  <em>plain</em>' ),
		];

		expect( collect( blocks ) ).toEqual( [
			{ level: 2, text: 'Bold and plain' },
		] );
	} );

	test( 'skips headings without text', () => {
		const blocks = [
			heading( 2, '' ),
			heading( 2, '   ' ),
			heading( 2, '<br>' ),
			heading( 2, undefined ),
		];

		expect( collect( blocks ) ).toEqual( [] );
	} );

	test( 'collects accordion item titles at their heading level', () => {
		const blocks = [
			accordionItem( 'Default', undefined ),
			accordionItem( 'Fourth', 'h4' ),
			accordionItem( 'Plain', 'none' ),
			accordionItem( '', 'h3' ),
		];

		expect( collect( blocks ) ).toEqual( [
			{ level: 3, text: 'Default' },
			{ level: 4, text: 'Fourth' },
		] );
	} );

	test( 'finds headings inside other blocks, in document order', () => {
		const blocks = [
			heading( 2, 'First' ),
			group( [
				heading( 3, 'Inside group' ),
				accordionItem( 'Section', 'h3', [ heading( 4, 'Deep' ) ] ),
			] ),
			heading( 2, 'Last' ),
		];

		expect( collect( blocks ).map( ( entry ) => entry.text ) ).toEqual( [
			'First',
			'Inside group',
			'Section',
			'Deep',
			'Last',
		] );
	} );

	test( 'leaves out everything inside an infobox', () => {
		const infobox = {
			name: 'lunar-blocks/infobox',
			attributes: {},
			innerBlocks: [ heading( 2, 'Hidden' ) ],
		};

		expect( collect( [ infobox, heading( 2, 'Shown' ) ] ) ).toEqual( [
			{ level: 2, text: 'Shown' },
		] );
	} );
} );

describe( 'TOC tree', () => {
	function entry( level, text ) {
		return { level, text };
	}

	function shape( nodes ) {
		return nodes.map( ( node ) => [
			node.entry.text,
			shape( node.children ),
		] );
	}

	test( 'nests deeper levels under the heading before them', () => {
		const tree = buildTree( [
			entry( 2, 'A' ),
			entry( 3, 'A1' ),
			entry( 3, 'A2' ),
			entry( 2, 'B' ),
		] );

		expect( shape( tree ) ).toEqual( [
			[
				'A',
				[
					[ 'A1', [] ],
					[ 'A2', [] ],
				],
			],
			[ 'B', [] ],
		] );
	} );

	test( 'a skipped level still nests under the closest heading above', () => {
		const tree = buildTree( [ entry( 2, 'A' ), entry( 4, 'A deep' ) ] );

		expect( shape( tree ) ).toEqual( [ [ 'A', [ [ 'A deep', [] ] ] ] ] );
	} );

	test( 'a heading above the first one starts at the top', () => {
		const tree = buildTree( [ entry( 3, 'Low' ), entry( 2, 'High' ) ] );

		expect( shape( tree ) ).toEqual( [
			[ 'Low', [] ],
			[ 'High', [] ],
		] );
	} );

	test( 'returns an empty tree for no entries', () => {
		expect( buildTree( [] ) ).toEqual( [] );
	} );
} );
