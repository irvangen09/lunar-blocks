/* global describe, test, expect, jest */
/**
 * Sorting a large Table must not build a new text comparer for every pair of
 * rows. The order itself is covered by table-sort.test.js.
 */
const { initSort } = require( '../src/table/frontend/sort' );

function sortedNames( count ) {
	const names = [];

	for ( let i = 0; i < count; i++ ) {
		names.push( `Item ${ ( i * 7919 ) % count }` );
	}

	document.body.innerHTML = `
		<div class="lunar-table" data-sort="true">
			<table class="lunar-table__table">
				<thead><tr>
					<th data-key="name" data-type="text">Name</th>
				</tr></thead>
				<tbody>${ names
					.map( ( n ) => `<tr><td data-key="name">${ n }</td></tr>` )
					.join( '' ) }</tbody>
			</table>
		</div>`;

	const block = document.querySelector( '.lunar-table' );

	initSort(
		block,
		block.querySelector( 'table' ),
		document.createElement( 'div' )
	);

	block.querySelector( 'th button' ).click();

	return [ ...block.querySelectorAll( 'tbody td' ) ].map(
		( cell ) => cell.textContent
	);
}

describe( 'sorting many rows', () => {
	test( 'builds no text comparer while rows are compared', () => {
		const collators = jest.spyOn( Intl, 'Collator' );
		const compare = jest.spyOn( String.prototype, 'localeCompare' );

		const names = sortedNames( 500 );

		// Every row is placed, and in the right order.
		expect( names ).toHaveLength( 500 );
		expect( names[ 0 ] ).toBe( 'Item 0' );
		expect( names[ 499 ] ).toBe( 'Item 499' );

		// Thousands of comparisons, no per-comparison setup.
		expect( collators.mock.calls.length ).toBeLessThanOrEqual( 1 );
		expect( compare ).not.toHaveBeenCalled();

		collators.mockRestore();
		compare.mockRestore();
	} );
} );
