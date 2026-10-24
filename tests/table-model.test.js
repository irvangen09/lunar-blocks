/* global describe, test, expect */
/**
 * Edits of the Table columns and rows.
 */
const {
	createTableData,
	deleteColumnData,
	deleteRowData,
	insertColumnData,
	insertRowData,
	updateItem,
} = require( '../src/table/model' );

const columns = [
	{ key: 'col_a', label: 'Name', type: 'text' },
	{ key: 'col_b', label: 'Price', type: 'number' },
];

const rows = [
	{ id: 'row_1', isDivider: false, col_a: 'Turnip', col_b: '10' },
	{ id: 'row_2', isDivider: true, dividerLabel: 'Summer' },
];

describe( 'table model', () => {
	test( 'creates a table with empty cells and unique keys', () => {
		const data = createTableData( '3', '2' );
		const keys = data.columns.map( ( col ) => col.key );

		expect( data.columns ).toHaveLength( 3 );
		expect( data.rows ).toHaveLength( 2 );
		expect( new Set( keys ).size ).toBe( 3 );
		expect( new Set( data.rows.map( ( row ) => row.id ) ).size ).toBe( 2 );

		data.rows.forEach( ( row ) => {
			expect( row.isDivider ).toBe( false );
			keys.forEach( ( key ) => expect( row[ key ] ).toBe( '' ) );
		} );
	} );

	test( 'starts a new table without search and sort', () => {
		const data = createTableData( '2', '2' );

		expect( data.enableSort ).toBe( false );
		expect( data.enableFilter ).toBe( false );
	} );

	test.each( [
		[ '', '' ],
		[ 'abc', '0' ],
		[ '-4', '-1' ],
	] )( 'counts "%s" and "%s" fall back to one', ( columnCount, rowCount ) => {
		const data = createTableData( columnCount, rowCount );

		expect( data.columns ).toHaveLength( 1 );
		expect( data.rows ).toHaveLength( 1 );
	} );

	test( 'inserts a column with an empty cell in every row', () => {
		const data = insertColumnData( columns, rows, 1 );
		const added = data.columns[ 1 ];

		expect( data.columns.map( ( col ) => col.key ) ).toEqual( [
			'col_a',
			added.key,
			'col_b',
		] );
		expect( added ).toMatchObject( { label: '', type: 'text' } );
		data.rows.forEach( ( row ) => expect( row[ added.key ] ).toBe( '' ) );
	} );

	test( 'deletes a column and its cells', () => {
		const data = deleteColumnData( columns, rows, 0 );

		expect( data.columns.map( ( col ) => col.key ) ).toEqual( [ 'col_b' ] );
		data.rows.forEach( ( row ) =>
			expect( row ).not.toHaveProperty( 'col_a' )
		);
		expect( data.rows[ 0 ].col_b ).toBe( '10' );
	} );

	test( 'inserts an empty row at the given place', () => {
		const result = insertRowData( columns, rows, 1 );

		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ] ).toBe( rows[ 0 ] );
		expect( result[ 2 ] ).toBe( rows[ 1 ] );
		expect( result[ 1 ] ).toMatchObject( {
			isDivider: false,
			col_a: '',
			col_b: '',
		} );
	} );

	test( 'deletes a row', () => {
		expect( deleteRowData( rows, 0 ) ).toEqual( [ rows[ 1 ] ] );
	} );

	test( 'updates one item and leaves the others', () => {
		const result = updateItem( rows, 1, { dividerLabel: 'Fall' } );

		expect( result[ 0 ] ).toBe( rows[ 0 ] );
		expect( result[ 1 ] ).toEqual( { ...rows[ 1 ], dividerLabel: 'Fall' } );
	} );

	test( 'never changes the arrays it is given', () => {
		const before = JSON.stringify( { columns, rows } );

		insertColumnData( columns, rows, 0 );
		deleteColumnData( columns, rows, 1 );
		insertRowData( columns, rows, 0 );
		deleteRowData( rows, 0 );
		updateItem( rows, 0, { col_a: 'x' } );

		expect( JSON.stringify( { columns, rows } ) ).toBe( before );
	} );
} );
