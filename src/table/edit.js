import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	Button,
} from '@wordpress/components';

import TableToolbar from './table-toolbar';
import {
	PRESET_DEFAULT,
	PRESET_1,
	PRESET_2,
	PRESET_3,
	PRESET_4,
	DEFAULT_IMAGE_WIDTH,
	columnAlignStyle,
	getImageWidth,
	headerAlignStyle,
	isCardPreset,
	supportsSort,
} from './utils';

const PRESET_OPTIONS = [
	{ label: __( 'Default', 'moon-blocks' ), value: PRESET_DEFAULT },
	{ label: __( 'Preset 1', 'moon-blocks' ), value: PRESET_1 },
	{ label: __( 'Preset 2', 'moon-blocks' ), value: PRESET_2 },
	{ label: __( 'Preset 3', 'moon-blocks' ), value: PRESET_3 },
	{ label: __( 'Preset 4', 'moon-blocks' ), value: PRESET_4 },
];

// Presets lay columns out by role, so the Inspector says which column
// does what.
const PRESET_HELP = {
	[ PRESET_DEFAULT ]: __(
		'A plain table that scrolls sideways on small screens.',
		'moon-blocks'
	),
	[ PRESET_1 ]: __(
		'A table with a flat header. On small screens each row becomes a card. An image first column becomes the card image and the next column its title.',
		'moon-blocks'
	),
	[ PRESET_2 ]: __(
		'A grid of cards. An image first column becomes the card image and the next column its title. The other columns become rows.',
		'moon-blocks'
	),
	[ PRESET_3 ]: __(
		'A list of cards with a checklist. An image first column becomes the card image and the next column its name. The next two text columns become badges, and the first is split at commas. The rest become fields.',
		'moon-blocks'
	),
	[ PRESET_4 ]: __(
		'A list of cards with a checklist. An image first column becomes the card image and the next column its name. The other columns become fields.',
		'moon-blocks'
	),
};

const TEXT_CELL_FORMATS = [ 'core/bold', 'core/italic', 'core/link' ];

function generateColumnKey() {
	return 'col_' + Math.random().toString( 36 ).slice( 2, 8 );
}

function generateRowId() {
	return 'row_' + Math.random().toString( 36 ).slice( 2, 10 );
}

function buildEmptyRow( columns ) {
	const row = { isDivider: false, id: generateRowId() };
	columns.forEach( ( col ) => {
		row[ col.key ] = '';
	} );
	return row;
}

function ImageCell( { image, width, onSelect, onRemove, onAlt, onFocus } ) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ onSelect }
				allowedTypes={ [ 'image' ] }
				value={ image?.id }
				render={ ( { open } ) => (
					// Focus bubbles up from the controls inside.

					<div onFocus={ onFocus }>
						{ image?.url ? (
							<div className="moon-table-editor__image-cell">
								<img
									src={ image.url }
									alt=""
									style={ { width: width + 'px' } }
								/>
								<TextControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Alt text', 'moon-blocks' ) }
									hideLabelFromVision
									placeholder={ __(
										'Describe this image…',
										'moon-blocks'
									) }
									value={ image.alt || '' }
									onChange={ onAlt }
								/>
								<Button
									variant="link"
									size="small"
									onClick={ open }
								>
									{ __( 'Replace', 'moon-blocks' ) }
								</Button>
								<Button
									variant="link"
									size="small"
									isDestructive
									onClick={ onRemove }
								>
									{ __( 'Remove image', 'moon-blocks' ) }
								</Button>
							</div>
						) : (
							<div className="moon-table-editor__image-empty">
								<Button
									variant="secondary"
									size="small"
									onClick={ open }
								>
									{ __( 'Choose image', 'moon-blocks' ) }
								</Button>
								<TextControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Image URL', 'moon-blocks' ) }
									hideLabelFromVision
									placeholder={ __(
										'or paste image URL…',
										'moon-blocks'
									) }
									onKeyDown={ ( event ) => {
										if ( 'Enter' !== event.key ) {
											return;
										}

										event.preventDefault();

										const url = event.target.value.trim();

										if ( url ) {
											onSelect( { id: 0, url, alt: '' } );
										}
									} }
								/>
							</div>
						) }
					</div>
				) }
			/>
		</MediaUploadCheck>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		preset,
		columns,
		rows,
		enableSort,
		enableFilter,
		showCardNote,
		showCardHighlight,
	} = attributes;

	// { rowIndex, colIndex } of the last-focused cell, which decides what
	// the toolbar can act on. rowIndex -1 means the header row.
	const [ focusedCell, setFocusedCell ] = useState( {
		rowIndex: null,
		colIndex: null,
	} );

	const [ pendingColumnCount, setPendingColumnCount ] = useState( '3' );
	const [ pendingRowCount, setPendingRowCount ] = useState( '3' );

	// Lets the width field be emptied while typing without snapping back
	// to the default.
	const [ widthDraft, setWidthDraft ] = useState( null );

	const blockProps = useBlockProps( {
		className: 'moon-table-editor',
	} );

	function resetFocus() {
		setFocusedCell( { rowIndex: null, colIndex: null } );
	}

	function createTable() {
		const columnCount = Math.max(
			1,
			parseInt( pendingColumnCount, 10 ) || 1
		);
		const rowCount = Math.max( 1, parseInt( pendingRowCount, 10 ) || 1 );

		const newColumns = [];
		for ( let i = 0; i < columnCount; i++ ) {
			newColumns.push( {
				key: generateColumnKey(),
				label: '',
				type: 'text',
			} );
		}

		const newRows = [];
		for ( let i = 0; i < rowCount; i++ ) {
			newRows.push( buildEmptyRow( newColumns ) );
		}

		setAttributes( { columns: newColumns, rows: newRows } );
	}

	function updateColumn( colIndex, changes ) {
		setAttributes( {
			columns: columns.map( ( col, i ) =>
				i === colIndex ? { ...col, ...changes } : col
			),
		} );
	}

	function setColumnType( type ) {
		const colIndex = focusedCell.colIndex;

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
		const colIndex = focusedCell.colIndex;

		if ( null === colIndex ) {
			return;
		}

		updateColumn( colIndex, { align } );
	}

	function insertColumn( atIndex ) {
		const newColumn = {
			key: generateColumnKey(),
			label: '',
			type: 'text',
		};
		const newColumns = [ ...columns ];
		newColumns.splice( atIndex, 0, newColumn );

		const newRows = rows.map( ( row ) => ( {
			...row,
			[ newColumn.key ]: '',
		} ) );

		setAttributes( { columns: newColumns, rows: newRows } );
		resetFocus();
	}

	function deleteColumn() {
		const colIndex = focusedCell.colIndex;

		if ( null === colIndex ) {
			return;
		}

		const key = columns[ colIndex ].key;
		const newColumns = columns.filter( ( _col, i ) => i !== colIndex );
		const newRows = rows.map( ( row ) => {
			const updated = { ...row };
			delete updated[ key ];
			return updated;
		} );

		setAttributes( { columns: newColumns, rows: newRows } );
		resetFocus();
	}

	function insertRow( atIndex ) {
		const newRows = [ ...rows ];
		newRows.splice( atIndex, 0, buildEmptyRow( columns ) );
		setAttributes( { rows: newRows } );
		resetFocus();
	}

	function deleteRow() {
		const rowIndex = focusedCell.rowIndex;

		if ( null === rowIndex || -1 === rowIndex ) {
			return;
		}

		setAttributes( { rows: rows.filter( ( _row, i ) => i !== rowIndex ) } );
		resetFocus();
	}

	function toggleDivider() {
		const rowIndex = focusedCell.rowIndex;

		if ( null === rowIndex || -1 === rowIndex ) {
			return;
		}

		updateRow( rowIndex, { isDivider: ! rows[ rowIndex ].isDivider } );
	}

	function updateRow( rowIndex, changes ) {
		setAttributes( {
			rows: rows.map( ( row, i ) =>
				i === rowIndex ? { ...row, ...changes } : row
			),
		} );
	}

	function updateCell( rowIndex, key, value ) {
		updateRow( rowIndex, { [ key ]: value } );
	}

	function updateCellImage( rowIndex, key, media ) {
		updateCell(
			rowIndex,
			key,
			media
				? { id: media.id, url: media.url, alt: media.alt || '' }
				: null
		);
	}

	function updateCellAlt( rowIndex, key, alt ) {
		const current = rows[ rowIndex ][ key ];

		if ( current ) {
			updateCell( rowIndex, key, { ...current, alt } );
		}
	}

	function focusCell( rowIndex, colIndex ) {
		setFocusedCell( { rowIndex, colIndex } );
	}

	const focusedColumn =
		null !== focusedCell.colIndex ? columns[ focusedCell.colIndex ] : null;

	function renderCell( row, rowIndex, col, colIndex ) {
		if ( 'image' === col.type ) {
			return (
				<ImageCell
					image={ row[ col.key ] }
					width={ getImageWidth( col ) }
					onSelect={ ( media ) =>
						updateCellImage( rowIndex, col.key, media )
					}
					onRemove={ () =>
						updateCellImage( rowIndex, col.key, null )
					}
					onAlt={ ( alt ) => updateCellAlt( rowIndex, col.key, alt ) }
					onFocus={ () => focusCell( rowIndex, colIndex ) }
				/>
			);
		}

		if ( 'number' === col.type ) {
			return (
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Cell value', 'moon-blocks' ) }
					hideLabelFromVision
					type="number"
					value={ row[ col.key ] ?? '' }
					onChange={ ( value ) =>
						updateCell( rowIndex, col.key, value )
					}
					onFocus={ () => focusCell( rowIndex, colIndex ) }
				/>
			);
		}

		return (
			<RichText
				tagName="div"
				className="moon-table-editor__cell-text"
				aria-label={ __( 'Cell value', 'moon-blocks' ) }
				value={ row[ col.key ] ?? '' }
				onChange={ ( value ) => updateCell( rowIndex, col.key, value ) }
				onFocus={ () => focusCell( rowIndex, colIndex ) }
				allowedFormats={ TEXT_CELL_FORMATS }
				placeholder={ __( 'Cell value', 'moon-blocks' ) }
			/>
		);
	}

	return (
		<>
			{ columns.length > 0 && (
				<TableToolbar
					preset={ preset }
					focusedCell={ focusedCell }
					rows={ rows }
					onInsertRowBefore={ () =>
						insertRow( focusedCell.rowIndex )
					}
					onInsertRowAfter={ () =>
						insertRow( focusedCell.rowIndex + 1 )
					}
					onDeleteRow={ deleteRow }
					onToggleDivider={ toggleDivider }
					onInsertColumnBefore={ () =>
						insertColumn( focusedCell.colIndex )
					}
					onInsertColumnAfter={ () =>
						insertColumn( focusedCell.colIndex + 1 )
					}
					onDeleteColumn={ deleteColumn }
					onSetColumnType={ setColumnType }
					onSetColumnAlign={ setColumnAlign }
				/>
			) }

			<InspectorControls>
				<PanelBody title={ __( 'Table Settings', 'moon-blocks' ) }>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Preset', 'moon-blocks' ) }
						help={ PRESET_HELP[ preset ] }
						value={ preset }
						options={ PRESET_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { preset: value } )
						}
					/>
					{ supportsSort( preset ) && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Sortable', 'moon-blocks' ) }
							checked={ enableSort }
							onChange={ ( value ) =>
								setAttributes( { enableSort: value } )
							}
						/>
					) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Searchable', 'moon-blocks' ) }
						checked={ enableFilter }
						onChange={ ( value ) =>
							setAttributes( { enableFilter: value } )
						}
					/>

					{ isCardPreset( preset ) && (
						<>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Note in card header',
									'moon-blocks'
								) }
								help={ __(
									'Shows the first column after the title as a small note, such as a level.',
									'moon-blocks'
								) }
								checked={ showCardNote }
								onChange={ ( value ) =>
									setAttributes( { showCardNote: value } )
								}
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Highlight band', 'moon-blocks' ) }
								help={ __(
									'Shows the last column as a highlighted band at the bottom of the card.',
									'moon-blocks'
								) }
								checked={ showCardHighlight }
								onChange={ ( value ) =>
									setAttributes( {
										showCardHighlight: value,
									} )
								}
							/>
						</>
					) }

					{ focusedColumn && 'image' === focusedColumn.type && (
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __(
								'Image width — focused column (px)',
								'moon-blocks'
							) }
							help={ __(
								'The focused column is whichever cell you last clicked.',
								'moon-blocks'
							) }
							type="number"
							min="1"
							value={
								widthDraft ??
								String( getImageWidth( focusedColumn ) )
							}
							onChange={ ( value ) => {
								setWidthDraft( value );

								const width = parseInt( value, 10 );

								if ( width > 0 ) {
									updateColumn( focusedCell.colIndex, {
										imageWidth: width,
									} );
								}
							} }
							onBlur={ () => setWidthDraft( null ) }
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ 0 === columns.length ? (
					<div className="moon-table-editor__empty">
						<p>{ __( 'Create a new table.', 'moon-blocks' ) }</p>
						<div className="moon-table-editor__empty-fields">
							<TextControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Number of columns',
									'moon-blocks'
								) }
								type="number"
								min="1"
								value={ pendingColumnCount }
								onChange={ setPendingColumnCount }
							/>
							<TextControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Number of rows', 'moon-blocks' ) }
								type="number"
								min="1"
								value={ pendingRowCount }
								onChange={ setPendingRowCount }
							/>
						</div>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ createTable }
						>
							{ __( 'Create Table', 'moon-blocks' ) }
						</Button>
					</div>
				) : (
					<table className="moon-table-editor__grid">
						<thead>
							<tr>
								{ columns.map( ( col, colIndex ) => (
									<th
										key={ col.key }
										style={ headerAlignStyle(
											col,
											preset
										) }
									>
										<TextControl
											__next40pxDefaultSize
											__nextHasNoMarginBottom
											label={ __(
												'Column label',
												'moon-blocks'
											) }
											hideLabelFromVision
											placeholder={ __(
												'Column label',
												'moon-blocks'
											) }
											value={ col.label }
											onChange={ ( value ) =>
												updateColumn( colIndex, {
													label: value,
												} )
											}
											onFocus={ () =>
												focusCell( -1, colIndex )
											}
										/>
									</th>
								) ) }
							</tr>
						</thead>
						<tbody>
							{ rows.map( ( row, rowIndex ) => (
								<tr
									key={ rowIndex }
									className={
										row.isDivider
											? 'moon-table-editor__row--divider'
											: undefined
									}
								>
									{ row.isDivider ? (
										<td colSpan={ columns.length }>
											<TextControl
												__next40pxDefaultSize
												__nextHasNoMarginBottom
												label={ __(
													'Divider text',
													'moon-blocks'
												) }
												hideLabelFromVision
												placeholder={ __(
													'Divider text…',
													'moon-blocks'
												) }
												value={ row.dividerLabel ?? '' }
												onChange={ ( value ) =>
													updateRow( rowIndex, {
														dividerLabel: value,
													} )
												}
												onFocus={ () =>
													focusCell( rowIndex, null )
												}
											/>
										</td>
									) : (
										columns.map( ( col, colIndex ) => (
											<td
												key={ col.key }
												style={ columnAlignStyle(
													col,
													preset
												) }
											>
												{ renderCell(
													row,
													rowIndex,
													col,
													colIndex
												) }
											</td>
										) )
									) }
								</tr>
							) ) }
						</tbody>
					</table>
				) }
			</div>
		</>
	);
}
