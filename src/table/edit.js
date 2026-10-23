import { useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

import Grid from './editor/grid';
import NewTableForm from './editor/new-table-form';
import SettingsPanel from './editor/settings-panel';
import TableToolbar from './table-toolbar';
import {
	createTableData,
	deleteColumnData,
	deleteRowData,
	insertColumnData,
	insertRowData,
	updateItem,
} from './model';
import { DEFAULT_IMAGE_WIDTH } from './utils';

const NO_FOCUS = { rowIndex: null, colIndex: null };

export default function Edit( { attributes, setAttributes } ) {
	const { preset, columns, rows } = attributes;

	// { rowIndex, colIndex } of the last-focused cell, which decides what
	// the toolbar can act on. rowIndex -1 means the header row.
	const [ focusedCell, setFocusedCell ] = useState( NO_FOCUS );

	const [ pendingColumnCount, setPendingColumnCount ] = useState( '3' );
	const [ pendingRowCount, setPendingRowCount ] = useState( '3' );
	const [ widthDraft, setWidthDraft ] = useState( null );

	const blockProps = useBlockProps( {
		className: 'moon-table-editor',
	} );

	const { rowIndex, colIndex } = focusedCell;
	const hasRowFocus = null !== rowIndex && -1 !== rowIndex;
	const focusedColumn = null !== colIndex ? columns[ colIndex ] : null;

	function resetFocus() {
		setFocusedCell( NO_FOCUS );
	}

	function updateColumn( index, changes ) {
		setAttributes( { columns: updateItem( columns, index, changes ) } );
	}

	function updateRow( index, changes ) {
		setAttributes( { rows: updateItem( rows, index, changes ) } );
	}

	function updateCell( index, key, value ) {
		updateRow( index, { [ key ]: value } );
	}

	const actions = {
		updateColumn,
		updateRow,
		updateCell,
		focusCell: ( row, col ) =>
			setFocusedCell( { rowIndex: row, colIndex: col } ),
		updateCellImage( index, key, media ) {
			updateCell(
				index,
				key,
				media
					? { id: media.id, url: media.url, alt: media.alt || '' }
					: null
			);
		},
		updateCellAlt( index, key, alt ) {
			const current = rows[ index ][ key ];

			if ( current ) {
				updateCell( index, key, { ...current, alt } );
			}
		},
	};

	function insertColumn( atIndex ) {
		setAttributes( insertColumnData( columns, rows, atIndex ) );
		resetFocus();
	}

	function deleteColumn() {
		if ( null === colIndex ) {
			return;
		}

		setAttributes( deleteColumnData( columns, rows, colIndex ) );
		resetFocus();
	}

	function insertRow( atIndex ) {
		setAttributes( { rows: insertRowData( columns, rows, atIndex ) } );
		resetFocus();
	}

	function deleteRow() {
		if ( ! hasRowFocus ) {
			return;
		}

		setAttributes( { rows: deleteRowData( rows, rowIndex ) } );
		resetFocus();
	}

	function toggleDivider() {
		if ( hasRowFocus ) {
			updateRow( rowIndex, { isDivider: ! rows[ rowIndex ].isDivider } );
		}
	}

	function setColumnType( type ) {
		if ( null === colIndex ) {
			return;
		}

		const changes = { type };

		if ( 'image' === type && ! columns[ colIndex ]?.imageWidth ) {
			changes.imageWidth = DEFAULT_IMAGE_WIDTH;
		}

		updateColumn( colIndex, changes );
	}

	function setColumnAlign( align ) {
		if ( null !== colIndex ) {
			updateColumn( colIndex, { align } );
		}
	}

	return (
		<>
			{ columns.length > 0 && (
				<TableToolbar
					preset={ preset }
					focusedCell={ focusedCell }
					rows={ rows }
					onInsertRowBefore={ () => insertRow( rowIndex ) }
					onInsertRowAfter={ () => insertRow( rowIndex + 1 ) }
					onDeleteRow={ deleteRow }
					onToggleDivider={ toggleDivider }
					onInsertColumnBefore={ () => insertColumn( colIndex ) }
					onInsertColumnAfter={ () => insertColumn( colIndex + 1 ) }
					onDeleteColumn={ deleteColumn }
					onSetColumnType={ setColumnType }
					onSetColumnAlign={ setColumnAlign }
				/>
			) }

			<SettingsPanel
				attributes={ attributes }
				setAttributes={ setAttributes }
				focusedColumn={ focusedColumn }
				widthDraft={ widthDraft }
				onWidthDraft={ setWidthDraft }
				onImageWidth={ ( imageWidth ) =>
					updateColumn( colIndex, { imageWidth } )
				}
			/>

			<div { ...blockProps }>
				{ 0 === columns.length ? (
					<NewTableForm
						columnCount={ pendingColumnCount }
						rowCount={ pendingRowCount }
						onColumnCount={ setPendingColumnCount }
						onRowCount={ setPendingRowCount }
						onCreate={ () =>
							setAttributes(
								createTableData(
									pendingColumnCount,
									pendingRowCount
								)
							)
						}
					/>
				) : (
					<Grid
						preset={ preset }
						columns={ columns }
						rows={ rows }
						actions={ actions }
					/>
				) }
			</div>
		</>
	);
}
