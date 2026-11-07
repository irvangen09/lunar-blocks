/* global describe, test, expect, beforeEach, jest */
/**
 * Sorting a Table on the front end, in a simulated page. The order of the rows,
 * the state read out to screen readers and the controls for the layouts
 * without a header row.
 */
const { initSort } = require( '../src/table/frontend/sort' );

const COLUMNS = [
	{ key: 'name', label: 'Name', type: 'text' },
	{ key: 'power', label: 'Power', type: 'number' },
];

function row( name, power, extra = '' ) {
	return `<tr${ extra }><td data-key="name">${ name }</td><td data-key="power">${ power }</td></tr>`;
}

function divider( text ) {
	return `<tr class="lunar-table__row--divider"><td colspan="2">${ text }</td></tr>`;
}

// A table with a header row: the Default layout and Preset 1.
function headerTable( bodyRows, { preset, type = 'text' } = {} ) {
	document.body.innerHTML = `
		<div class="lunar-table" data-sort="true"${
			preset ? ` data-preset="${ preset }"` : ''
		}>
			<table class="lunar-table__table">
				<thead><tr>
					<th data-key="pic" data-type="image">Picture</th>
					<th data-key="name" data-type="text">Name</th>
					<th data-key="power" data-type="${ type }">Power</th>
				</tr></thead>
				<tbody>${ bodyRows.join( '' ) }</tbody>
			</table>
		</div>`;

	return mount();
}

// A layout without a header row saves its columns on the block.
function cardTable( bodyRows, columns = COLUMNS ) {
	document.body.innerHTML = `
		<div class="lunar-table" data-sort="true" data-columns='${ JSON.stringify(
			columns
		) }'>
			<table class="lunar-table__cards">
				<tbody>${ bodyRows.join( '' ) }</tbody>
			</table>
		</div>`;

	return mount();
}

function mount() {
	const block = document.querySelector( '.lunar-table' );
	const table = block.querySelector( 'table' );
	const controls = document.createElement( 'div' );

	initSort( block, table, controls );

	return { block, table, controls };
}

function order( table ) {
	return [ ...table.tBodies[ 0 ].rows ].map( ( r ) =>
		(
			r.querySelector( '[data-key="name"]' ) || r.cells[ 0 ]
		).textContent.trim()
	);
}

function header( table, key ) {
	return table.querySelector( `th[data-key="${ key }"]` );
}

function click( table, key ) {
	header( table, key ).querySelector( 'button' ).click();
}

function choose( controls, value ) {
	const select = controls.querySelector( 'select' );

	select.value = value;
	select.dispatchEvent( new window.Event( 'change' ) );
}

beforeEach( () => {
	document.body.innerHTML = '';
	window.matchMedia = jest.fn( () => ( {
		matches: false,
		addEventListener: jest.fn(),
	} ) );
} );

describe( 'sorting by a column header', () => {
	test( 'puts a button in each header, except in an image column', () => {
		const { table } = headerTable( [ row( 'Egg', 1 ) ] );

		expect(
			header( table, 'name' ).querySelector( 'button' )
		).not.toBeNull();
		expect(
			header( table, 'power' ).querySelector( 'button' )
		).not.toBeNull();
		expect( header( table, 'pic' ).querySelector( 'button' ) ).toBeNull();
		expect( header( table, 'name' ).getAttribute( 'aria-sort' ) ).toBe(
			'none'
		);
		expect( header( table, 'name' ).textContent.trim() ).toBe( 'Name' );
	} );

	test( 'steps through ascending, descending and the saved order', () => {
		const { table } = headerTable( [
			row( 'Pear', 1 ),
			row( 'apple', 2 ),
			row( 'Fig', 3 ),
		] );

		click( table, 'name' );
		expect( order( table ) ).toEqual( [ 'apple', 'Fig', 'Pear' ] );
		expect( header( table, 'name' ).getAttribute( 'aria-sort' ) ).toBe(
			'ascending'
		);

		click( table, 'name' );
		expect( order( table ) ).toEqual( [ 'Pear', 'Fig', 'apple' ] );
		expect( header( table, 'name' ).getAttribute( 'aria-sort' ) ).toBe(
			'descending'
		);

		click( table, 'name' );
		expect( order( table ) ).toEqual( [ 'Pear', 'apple', 'Fig' ] );
		expect( header( table, 'name' ).getAttribute( 'aria-sort' ) ).toBe(
			'none'
		);
	} );

	test( 'only the sorted column is marked, and the mark follows the sort', () => {
		const { table } = headerTable( [ row( 'Egg', 2 ), row( 'Ant', 1 ) ] );
		const sorted = () =>
			[ ...table.querySelectorAll( '.lunar-table__cell--sorted' ) ].map(
				( cell ) => cell.dataset.key
			);

		expect( sorted() ).toEqual( [] );

		click( table, 'name' );
		expect( sorted() ).toEqual( [ 'name', 'name' ] );

		click( table, 'power' );
		expect( sorted() ).toEqual( [ 'power', 'power' ] );
		expect( header( table, 'name' ).getAttribute( 'aria-sort' ) ).toBe(
			'none'
		);
		expect( header( table, 'power' ).getAttribute( 'aria-sort' ) ).toBe(
			'ascending'
		);

		click( table, 'power' );
		click( table, 'power' );
		expect( sorted() ).toEqual( [] );
	} );

	test( 'sorts numbers numerically, not digit by digit', () => {
		const { table } = headerTable(
			[
				row( 'A', 100 ),
				row( 'B', 9 ),
				row( 'C', '1.000 G' ),
				row( 'D', 20 ),
			],
			{ type: 'number' }
		);

		click( table, 'power' );
		expect( order( table ) ).toEqual( [ 'B', 'D', 'A', 'C' ] );

		click( table, 'power' );
		expect( order( table ) ).toEqual( [ 'C', 'A', 'D', 'B' ] );
	} );

	test( 'a column marked as amounts sorts by amount, whatever else it holds', () => {
		// As text, "1.000 G" would come before "200 G".
		const { table } = headerTable(
			[ row( 'A', '1.000 G' ), row( 'B', '200 G' ), row( 'C', 'word' ) ],
			{ type: 'number' }
		);

		click( table, 'power' );
		expect( order( table ) ).toEqual( [ 'B', 'A', 'C' ] );
	} );

	test( 'a text column that holds only amounts sorts by amount too', () => {
		const { table } = headerTable(
			[ row( 'A', '100 G' ), row( 'B', '9 G' ), row( 'C', '20 G' ) ],
			{ type: 'text' }
		);

		click( table, 'power' );
		expect( order( table ) ).toEqual( [ 'B', 'C', 'A' ] );
	} );

	test( 'a column of words with one number in it still sorts as text', () => {
		const { table } = headerTable(
			[ row( 'A', 'zebra' ), row( 'B', '10' ), row( 'C', 'apple' ) ],
			{ type: 'text' }
		);

		click( table, 'power' );
		expect( order( table ) ).toEqual( [ 'B', 'C', 'A' ] );
	} );

	test( 'empty cells and "N/A" go last in both directions', () => {
		const { table } = headerTable(
			[
				row( 'None', '' ),
				row( 'Low', 1 ),
				row( 'Dash', '—' ),
				row( 'High', 5 ),
				row( 'NA', 'N/A' ),
			],
			{ type: 'number' }
		);

		click( table, 'power' );
		expect( order( table ).slice( 0, 2 ) ).toEqual( [ 'Low', 'High' ] );
		expect( order( table ).slice( 2 ).sort() ).toEqual( [
			'Dash',
			'NA',
			'None',
		] );

		click( table, 'power' );
		expect( order( table ).slice( 0, 2 ) ).toEqual( [ 'High', 'Low' ] );
		expect( order( table ).slice( 2 ).sort() ).toEqual( [
			'Dash',
			'NA',
			'None',
		] );
	} );

	test( 'rows with equal values keep their saved order', () => {
		const { table } = headerTable(
			[
				row( 'First', 5 ),
				row( 'Second', 5 ),
				row( 'Third', 5 ),
				row( 'Zero', 0 ),
			],
			{ type: 'number' }
		);

		click( table, 'power' );
		expect( order( table ) ).toEqual( [
			'Zero',
			'First',
			'Second',
			'Third',
		] );
	} );

	test( 'sorts inside each divider and keeps the dividers where they are', () => {
		const { table } = headerTable( [
			row( 'Mid', 1 ),
			row( 'Zed', 2 ),
			row( 'Amy', 3 ),
			divider( 'Group B' ),
			row( 'Yan', 4 ),
			row( 'Bob', 5 ),
			divider( 'Group C' ),
			row( 'Xia', 6 ),
		] );
		const saved = [
			'Mid',
			'Zed',
			'Amy',
			'Group B',
			'Yan',
			'Bob',
			'Group C',
			'Xia',
		];

		click( table, 'name' );
		expect( order( table ) ).toEqual( [
			'Amy',
			'Mid',
			'Zed',
			'Group B',
			'Bob',
			'Yan',
			'Group C',
			'Xia',
		] );

		click( table, 'name' );
		expect( order( table ) ).toEqual( [
			'Zed',
			'Mid',
			'Amy',
			'Group B',
			'Yan',
			'Bob',
			'Group C',
			'Xia',
		] );

		click( table, 'name' );
		expect( order( table ) ).toEqual( saved );
	} );

	test( 'the amount decision uses every section, not each on its own', () => {
		// One section is all amounts; the other has a word, so the whole
		// column sorts as text, where "1.000 G" comes before "200 G".
		const { table } = headerTable(
			[
				row( 'B', '200 G' ),
				row( 'A', '1.000 G' ),
				divider( 'More' ),
				row( 'C', 'word' ),
			],
			{ type: 'text' }
		);

		click( table, 'power' );
		expect( order( table ) ).toEqual( [ 'A', 'B', 'More', 'C' ] );
	} );

	test( 'has no sort bar when the header row does the sorting', () => {
		const { controls } = headerTable( [ row( 'Egg', 1 ) ] );

		expect( controls.children ).toHaveLength( 0 );
	} );
} );

describe( 'the sort bar of Preset 1', () => {
	test( 'adds a list and a disabled direction button', () => {
		const { controls } = headerTable( [ row( 'Egg', 1 ) ], {
			preset: 'preset-1',
		} );
		const select = controls.querySelector( 'select' );
		const direction = controls.querySelector(
			'.lunar-table__sort-direction'
		);

		expect( select.getAttribute( 'aria-label' ) ).toBe( 'Sort by' );
		expect( [ ...select.options ].map( ( o ) => o.value ) ).toEqual( [
			'',
			'name',
			'power',
		] );
		expect( direction.disabled ).toBe( true );
		expect( direction.getAttribute( 'aria-pressed' ) ).toBe( 'false' );
	} );

	test( 'the list, the button and the header share one sort', () => {
		const { table, controls } = headerTable(
			[ row( 'B', 2 ), row( 'C', 3 ), row( 'A', 1 ) ],
			{ preset: 'preset-1', type: 'number' }
		);
		const direction = controls.querySelector(
			'.lunar-table__sort-direction'
		);

		choose( controls, 'power' );
		expect( order( table ) ).toEqual( [ 'A', 'B', 'C' ] );
		expect( header( table, 'power' ).getAttribute( 'aria-sort' ) ).toBe(
			'ascending'
		);
		expect( direction.disabled ).toBe( false );

		direction.click();
		expect( order( table ) ).toEqual( [ 'C', 'B', 'A' ] );
		expect( direction.getAttribute( 'aria-pressed' ) ).toBe( 'true' );

		// A click on the header carries on from what the list chose.
		click( table, 'power' );
		expect( order( table ) ).toEqual( [ 'B', 'C', 'A' ] );
		expect( controls.querySelector( 'select' ).value ).toBe( '' );
		expect( direction.disabled ).toBe( true );
	} );

	test( 'the list sorts a column marked as amounts by amount', () => {
		const { table, controls } = headerTable(
			[ row( 'A', '1.000 G' ), row( 'B', '200 G' ), row( 'C', 'word' ) ],
			{ preset: 'preset-1', type: 'number' }
		);

		choose( controls, 'power' );
		expect( order( table ) ).toEqual( [ 'B', 'A', 'C' ] );
	} );

	test( 'choosing the original order brings the saved order back', () => {
		const { table, controls } = headerTable(
			[ row( 'B', 2 ), row( 'A', 1 ) ],
			{ preset: 'preset-1' }
		);

		choose( controls, 'name' );
		expect( order( table ) ).toEqual( [ 'A', 'B' ] );

		choose( controls, '' );
		expect( order( table ) ).toEqual( [ 'B', 'A' ] );
	} );

	test( 'keeps the header buttons out of the tab order on small screens', () => {
		const listeners = [];

		window.matchMedia = jest.fn( () => ( {
			matches: true,
			addEventListener: ( type, listener ) =>
				listeners.push( [ type, listener ] ),
		} ) );

		const { table } = headerTable( [ row( 'Egg', 1 ) ], {
			preset: 'preset-1',
		} );
		const buttons = [ ...table.querySelectorAll( 'thead button' ) ];

		expect( window.matchMedia ).toHaveBeenCalledWith(
			'(max-width: 781px)'
		);
		expect( buttons ).toHaveLength( 2 );
		buttons.forEach( ( button ) => expect( button.tabIndex ).toBe( -1 ) );
		expect( listeners.map( ( [ type ] ) => type ) ).toEqual( [ 'change' ] );
	} );

	test( 'puts the header buttons back in the tab order on wide screens', () => {
		const { table } = headerTable( [ row( 'Egg', 1 ) ], {
			preset: 'preset-1',
		} );

		table.querySelectorAll( 'thead button' ).forEach( ( button ) => {
			expect( button.hasAttribute( 'tabindex' ) ).toBe( false );
		} );
	} );
} );

describe( 'a layout without a header row', () => {
	test( 'reads its columns from the block and adds the sort bar', () => {
		const { controls } = cardTable( [ row( 'Egg', 1 ) ] );
		const options = [ ...controls.querySelectorAll( 'option' ) ];

		expect( options.map( ( o ) => o.value ) ).toEqual( [
			'',
			'name',
			'power',
		] );
		expect( options.map( ( o ) => o.textContent ) ).toEqual( [
			'Original order',
			'Sort: Name',
			'Sort: Power',
		] );
	} );

	test( 'sorts the cards and reverses them with the direction button', () => {
		const { table, controls } = cardTable( [
			row( 'B', 20 ),
			row( 'C', 100 ),
			row( 'A', 3 ),
		] );

		choose( controls, 'power' );
		expect( order( table ) ).toEqual( [ 'A', 'B', 'C' ] );

		controls.querySelector( '.lunar-table__sort-direction' ).click();
		expect( order( table ) ).toEqual( [ 'C', 'B', 'A' ] );

		choose( controls, '' );
		expect( order( table ) ).toEqual( [ 'B', 'C', 'A' ] );
	} );

	test( 'sorts a column marked as amounts by amount', () => {
		const { table, controls } = cardTable( [
			row( 'A', '1.000 G' ),
			row( 'B', '200 G' ),
			row( 'C', 'word' ),
		] );

		choose( controls, 'power' );
		expect( order( table ) ).toEqual( [ 'B', 'A', 'C' ] );
	} );

	test( 'a muted dash counts as empty and goes last', () => {
		const muted =
			'<tr><td><span data-key="name">Dash</span><span data-key="power" class="lunar-table__card-value--muted">—</span></td></tr>';
		const { table, controls } = cardTable( [
			muted,
			row( 'Low', 1 ),
			row( 'High', 9 ),
		] );

		choose( controls, 'power' );
		expect( order( table ) ).toEqual( [ 'Low', 'High', 'Dash' ] );

		controls.querySelector( '.lunar-table__sort-direction' ).click();
		expect( order( table ) ).toEqual( [ 'High', 'Low', 'Dash' ] );
	} );

	test( 'a column shown as several chips is sorted by all of them', () => {
		const chips = ( name, tags ) =>
			`<tr><td><span data-key="name">${ name }</span>${ tags
				.map( ( tag ) => `<span data-key="tags">${ tag }</span>` )
				.join( '' ) }</td></tr>`;
		const { table, controls } = cardTable(
			[
				chips( 'One', [ 'water', 'fire' ] ),
				chips( 'Two', [ 'air' ] ),
				chips( 'Three', [ 'water', 'earth' ] ),
			],
			[
				{ key: 'name', label: 'Name' },
				{ key: 'tags', label: 'Tags', type: 'text' },
			]
		);

		choose( controls, 'tags' );
		expect( order( table ) ).toEqual( [ 'Two', 'Three', 'One' ] );
	} );

	test.each( [ [ 'not json' ], [ '{"a":1}' ], [ '[]' ] ] )(
		'adds nothing when the saved columns are %s',
		( saved ) => {
			document.body.innerHTML = `<div class="lunar-table" data-sort="true"></div>`;

			const block = document.querySelector( '.lunar-table' );
			const table = document.createElement( 'table' );
			const controls = document.createElement( 'div' );

			block.dataset.columns = saved;
			table.innerHTML = `<tbody>${ row( 'Egg', 1 ) }</tbody>`;
			block.appendChild( table );

			expect( () => initSort( block, table, controls ) ).not.toThrow();
			expect( controls.children ).toHaveLength( 0 );
		}
	);
} );
