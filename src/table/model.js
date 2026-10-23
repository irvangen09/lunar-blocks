// Pure edits of the columns and rows attributes. Each function returns the
// attributes to store and leaves its arguments untouched.

function generateColumnKey() {
	return 'col_' + Math.random().toString( 36 ).slice( 2, 8 );
}

function generateRowId() {
	return 'row_' + Math.random().toString( 36 ).slice( 2, 10 );
}

function createColumn() {
	return { key: generateColumnKey(), label: '', type: 'text' };
}

export function buildEmptyRow( columns ) {
	const row = { isDivider: false, id: generateRowId() };

	columns.forEach( ( col ) => {
		row[ col.key ] = '';
	} );

	return row;
}

// Counts come from text fields, so anything that is not a positive whole
// number counts as 1.
export function createTableData( columnCount, rowCount ) {
	const columns = Array.from(
		{ length: Math.max( 1, parseInt( columnCount, 10 ) || 1 ) },
		createColumn
	);
	const rows = Array.from(
		{ length: Math.max( 1, parseInt( rowCount, 10 ) || 1 ) },
		() => buildEmptyRow( columns )
	);

	return { columns, rows };
}

export function insertColumnData( columns, rows, atIndex ) {
	const newColumn = createColumn();
	const newColumns = [ ...columns ];

	newColumns.splice( atIndex, 0, newColumn );

	return {
		columns: newColumns,
		rows: rows.map( ( row ) => ( { ...row, [ newColumn.key ]: '' } ) ),
	};
}

export function deleteColumnData( columns, rows, colIndex ) {
	const key = columns[ colIndex ].key;

	return {
		columns: columns.filter( ( _col, i ) => i !== colIndex ),
		rows: rows.map( ( row ) => {
			const updated = { ...row };

			delete updated[ key ];

			return updated;
		} ),
	};
}

export function insertRowData( columns, rows, atIndex ) {
	const newRows = [ ...rows ];

	newRows.splice( atIndex, 0, buildEmptyRow( columns ) );

	return newRows;
}

export function deleteRowData( rows, rowIndex ) {
	return rows.filter( ( _row, i ) => i !== rowIndex );
}

export function updateItem( list, index, changes ) {
	return list.map( ( item, i ) =>
		i === index ? { ...item, ...changes } : item
	);
}
