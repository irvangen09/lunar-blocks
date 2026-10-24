/* global describe, test, expect */
/**
 * Reading the number a table cell starts with, for sorting.
 */
const {
	isNoValue,
	isNumericColumn,
	parseLeadingNumber,
} = require( '../src/table/frontend/number' );

describe( 'table cell numbers', () => {
	test.each( [
		[ '100 G', 100 ],
		[ '1.000 G', 1000 ],
		[ '30.000 G', 30000 ],
		[ '1.000.000', 1000000 ],
		[ '1,000', 1000 ],
		[ '1.500,50', 1500.5 ],
		[ '1,500.50', 1500.5 ],
		[ '2,5 kg', 2.5 ],
		[ '0.25', 0.25 ],
		[ '0.250', 0.25 ],
		[ '12.5', 12.5 ],
		[ '+20 STA', 20 ],
		[ '-50 FAT', -50 ],
		[ '−50 FAT', -50 ],
		[ '  7', 7 ],
		[ '5.', 5 ],
	] )( 'reads "%s" as %s', ( text, expected ) => {
		expect( parseLeadingNumber( text ) ).toBe( expected );
	} );

	test.each( [ [ '' ], [ 'Egg' ], [ 'N/A' ], [ 'x 20' ], [ '.5' ] ] )(
		'finds no number in "%s"',
		( text ) => {
			expect( parseLeadingNumber( text ) ).toBeNull();
		}
	);

	test( 'amounts rank by value, not by digits', () => {
		const values = [ '1.000 G', '100 G', '30.000 G', '5.000 G', '900 G' ]
			.map( ( text ) => [ text, parseLeadingNumber( text ) ] )
			.sort( ( a, b ) => a[ 1 ] - b[ 1 ] )
			.map( ( pair ) => pair[ 0 ] );

		expect( values ).toEqual( [
			'100 G',
			'900 G',
			'1.000 G',
			'5.000 G',
			'30.000 G',
		] );
	} );

	test( 'empty and N/A count as no value', () => {
		[ '', 'N/A', 'n/a', '-', '—' ].forEach( ( text ) =>
			expect( isNoValue( text ) ).toBe( true )
		);
		expect( isNoValue( '0' ) ).toBe( false );
	} );

	test( 'a column is numeric when every value has a number', () => {
		expect( isNumericColumn( [ '100 G', '', 'N/A', '1.000 G' ] ) ).toBe(
			true
		);
		expect( isNumericColumn( [ '100 G', 'Egg' ] ) ).toBe( false );
		expect( isNumericColumn( [ '', 'N/A' ] ) ).toBe( false );
		expect( isNumericColumn( [ 'Buat 10 hidangan', 'Eps.2' ] ) ).toBe(
			false
		);
	} );
} );
