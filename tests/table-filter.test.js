/* global describe, test, expect, beforeEach, afterEach, jest */
/**
 * Searching a Table on the front end, in a simulated page. Rows are hidden as
 * the visitor types, and the number of results is announced to screen readers.
 */
const { initFilter } = require( '../src/table/frontend/filter' );

function row( name, level ) {
	return `<tr><td data-key="name">${ name }</td><td data-key="level">${ level }</td></tr>`;
}

function divider( text ) {
	return `<tr class="lunar-table__row--divider"><td colspan="2">${ text }</td></tr>`;
}

function mount( bodyRows ) {
	document.body.innerHTML = `
		<div class="lunar-table" data-filter="true">
			<table class="lunar-table__table">
				<tbody>${ bodyRows.join( '' ) }</tbody>
			</table>
		</div>`;

	const table = document.querySelector( 'table' );
	const controls = document.createElement( 'div' );

	initFilter( table, controls );
	document.body.appendChild( controls );

	return { table, controls };
}

function type( controls, text ) {
	const input = controls.querySelector( 'input' );

	input.value = text;
	input.dispatchEvent( new window.Event( 'input' ) );
}

function visible( table ) {
	return [ ...table.tBodies[ 0 ].rows ]
		.filter( ( r ) => ! r.hidden )
		.map( ( r ) => r.cells[ 0 ].textContent.trim() );
}

const SAMPLE = [
	row( 'Apple', 'Easy' ),
	row( 'Banana', 'Hard' ),
	divider( 'Group B' ),
	row( 'Cherry', 'Easy' ),
];

beforeEach( () => {
	jest.useFakeTimers();
} );

afterEach( () => {
	jest.useRealTimers();
} );

describe( 'searching a table', () => {
	test( 'adds a labelled search box', () => {
		const { controls } = mount( SAMPLE );
		const input = controls.querySelector( 'input' );

		expect( input.type ).toBe( 'search' );
		expect( input.getAttribute( 'aria-label' ) ).toBe(
			'Search within this table'
		);
	} );

	test( 'hides rows that do not match, ignoring case and spaces', () => {
		const { table, controls } = mount( SAMPLE );

		type( controls, '  eASY ' );
		expect( visible( table ) ).toEqual( [ 'Apple', 'Group B', 'Cherry' ] );

		type( controls, 'banana' );
		expect( visible( table ) ).toEqual( [ 'Banana' ] );
	} );

	test( 'hides a divider when nothing under it matches', () => {
		const { table, controls } = mount( SAMPLE );

		type( controls, 'apple' );
		expect( visible( table ) ).toEqual( [ 'Apple' ] );
	} );

	test( 'shows every row again when the search is cleared', () => {
		const { table, controls } = mount( SAMPLE );

		type( controls, 'banana' );
		type( controls, '' );
		expect( visible( table ) ).toEqual( [
			'Apple',
			'Banana',
			'Group B',
			'Cherry',
		] );
	} );

	test( 'does not match the labels of a card', () => {
		const card =
			'<tr><td><span class="lunar-table__card-label">Level</span><span data-key="name">Plum</span></td></tr>';
		const { table, controls } = mount( [ card, row( 'Fig', 'Easy' ) ] );

		type( controls, 'level' );
		expect( visible( table ) ).toEqual( [] );
	} );
} );

describe( 'telling the visitor what the search found', () => {
	const status = ( controls ) => controls.querySelector( '[role="status"]' );
	const emptyMessage = ( controls ) =>
		controls.querySelector( '.lunar-table__filter-empty' );

	test( 'has a status region from the start, and it is empty', () => {
		const { controls } = mount( SAMPLE );

		expect( status( controls ) ).not.toBeNull();
		expect( status( controls ).textContent ).toBe( '' );
		expect( emptyMessage( controls ).hidden ).toBe( true );
	} );

	test( 'announces the number of results, not the rows hidden', () => {
		const { controls } = mount( SAMPLE );

		type( controls, 'easy' );
		jest.runAllTimers();
		expect( status( controls ).textContent ).toBe( '2 results' );

		type( controls, 'banana' );
		jest.runAllTimers();
		expect( status( controls ).textContent ).toBe( '1 result' );
	} );

	test( 'waits for the visitor to stop typing before it announces', () => {
		const { controls } = mount( SAMPLE );

		type( controls, 'e' );
		type( controls, 'ea' );
		type( controls, 'eas' );
		expect( status( controls ).textContent ).toBe( '' );

		jest.runAllTimers();
		expect( status( controls ).textContent ).toBe( '2 results' );
	} );

	test( 'says so when nothing matches, in the status and on the page', () => {
		const { controls } = mount( SAMPLE );

		type( controls, 'zzz' );
		jest.runAllTimers();

		expect( status( controls ).textContent ).toBe(
			'No results for this search.'
		);
		expect( emptyMessage( controls ).hidden ).toBe( false );
		expect( emptyMessage( controls ).textContent ).toBe(
			'No results for this search.'
		);
	} );

	test( 'shows the empty message as soon as the rows are gone', () => {
		const { controls } = mount( SAMPLE );

		type( controls, 'zzz' );
		expect( emptyMessage( controls ).hidden ).toBe( false );

		type( controls, 'apple' );
		expect( emptyMessage( controls ).hidden ).toBe( true );
	} );

	test( 'goes quiet when the search is cleared', () => {
		const { controls } = mount( SAMPLE );

		type( controls, 'zzz' );
		jest.runAllTimers();
		type( controls, '' );

		expect( status( controls ).textContent ).toBe( '' );
		expect( emptyMessage( controls ).hidden ).toBe( true );

		// A pending announcement of the old search must not come back.
		jest.runAllTimers();
		expect( status( controls ).textContent ).toBe( '' );
	} );

	test( 'does not count dividers as results', () => {
		const { controls } = mount( SAMPLE );

		type( controls, 'cherry' );
		jest.runAllTimers();
		expect( status( controls ).textContent ).toBe( '1 result' );
	} );
} );
