import { RichText, useBlockProps } from '@wordpress/block-editor';

import {
	PRESET_3,
	columnAlignStyle,
	getCardRoles,
	getCardRowCount,
	getColumnRoles,
	getImageWidth,
	getPlainText,
	headerAlignStyle,
	isBlankCell,
	isCardPreset,
	isNotApplicable,
	isRecipePreset,
	supportsSort,
} from './utils';

// The width is set on the image itself, not its wrapper, so a theme rule
// for img cannot bring back the original size. The same value is kept in
// a custom property for the stylesheet, which can hold the width against a
// theme rule that is marked !important.
function renderImage( col, image ) {
	if ( ! image?.url ) {
		return null;
	}

	const width = getImageWidth( col ) + 'px';

	return (
		<img
			className="moon-table__image"
			src={ image.url }
			alt={ image.alt || '' }
			style={ {
				width,
				height: 'auto',
				'--moon-table-image-width': width,
			} }
		/>
	);
}

// Text cells may contain inline formatting (bold, italic, link) saved
// by RichText; other cell types are plain values.
function renderCellValue( col, value ) {
	if ( 'image' === col.type ) {
		return renderImage( col, value );
	}

	if ( 'text' === col.type ) {
		return <RichText.Content value={ value ?? '' } />;
	}

	return value ?? '';
}

function renderDividerRow( row, index, cellClassName, colSpan ) {
	return (
		<tr key={ index } className="moon-table__row--divider">
			<td colSpan={ colSpan } className={ cellClassName }>
				{ row.dividerLabel ?? '' }
			</td>
		</tr>
	);
}

function renderTable( { columns, rows, preset } ) {
	const { imageCol, titleCol } = getColumnRoles( columns );

	function cellClassName( col ) {
		const names = [];

		if ( 'image' === col.type ) {
			names.push( 'moon-table__cell--image' );
		}

		if ( col === imageCol ) {
			names.push( 'moon-table__cell--lead' );
		}

		if ( col === titleCol ) {
			names.push( 'moon-table__cell--title' );
		}

		return names.join( ' ' ) || undefined;
	}

	return (
		<table className="moon-table__table">
			<thead>
				<tr>
					{ columns.map( ( col ) => (
						<th
							key={ col.key }
							scope="col"
							data-key={ col.key }
							data-type={ col.type }
							style={ headerAlignStyle( col, preset ) }
						>
							{ col.label }
						</th>
					) ) }
				</tr>
			</thead>
			<tbody>
				{ rows.map( ( row, index ) => {
					if ( row.isDivider ) {
						return renderDividerRow(
							row,
							index,
							'moon-table__divider-cell',
							columns.length
						);
					}

					return (
						<tr key={ index }>
							{ columns.map( ( col ) => (
								<td
									key={ col.key }
									className={ cellClassName( col ) }
									data-label={ col.label }
									data-key={ col.key }
									style={ columnAlignStyle( col, preset ) }
								>
									{ renderCellValue( col, row[ col.key ] ) }
								</td>
							) ) }
						</tr>
					);
				} ) }
			</tbody>
		</table>
	);
}

// A label with its value. Empty and "N/A" values show a muted dash,
// and the row stays so the cards of a grid keep their rows aligned.
function renderCardField( col, value, className ) {
	const isMuted = isBlankCell( col, value ) || isNotApplicable( col, value );

	return (
		<td key={ col.key } className={ className }>
			<span className="moon-table__card-label">{ col.label }</span>
			<span
				className={
					isMuted
						? 'moon-table__card-value moon-table__card-value--muted'
						: 'moon-table__card-value'
				}
			>
				{ isMuted ? '—' : renderCellValue( col, value ) }
			</span>
		</td>
	);
}

// Roles follow the column type: an image first column, then the title,
// then an optional note, detail rows and an optional highlight band.
function renderCards( { columns, rows, showCardNote, showCardHighlight } ) {
	const { imageCol, titleCol, noteCol, highlightCol, detailCols } =
		getCardRoles( columns, { showCardNote, showCardHighlight } );

	return (
		<table className="moon-table__cards">
			<tbody>
				{ rows.map( ( row, index ) => {
					if ( row.isDivider ) {
						return renderDividerRow(
							row,
							index,
							'moon-table__cards-divider-cell'
						);
					}

					const note =
						noteCol &&
						! isBlankCell( noteCol, row[ noteCol.key ] ) &&
						! isNotApplicable( noteCol, row[ noteCol.key ] );

					return (
						<tr key={ index } className="moon-table__card">
							<td className="moon-table__card-head">
								{ imageCol &&
									renderImage(
										imageCol,
										row[ imageCol.key ]
									) }
								<span className="moon-table__card-title">
									{ titleCol
										? renderCellValue(
												titleCol,
												row[ titleCol.key ]
											)
										: '' }
								</span>
								{ note && (
									<span className="moon-table__card-note">
										{ renderCellValue(
											noteCol,
											row[ noteCol.key ]
										) }
									</span>
								) }
							</td>

							{ detailCols.map( ( col ) =>
								renderCardField(
									col,
									row[ col.key ],
									'moon-table__card-detail'
								)
							) }

							{ highlightCol &&
								renderCardField(
									highlightCol,
									row[ highlightCol.key ],
									'moon-table__card-highlight'
								) }
						</tr>
					);
				} ) }
			</tbody>
		</table>
	);
}

// Chips come from the plain text of a cell: a comma splits one cell
// into several chips, which formatted HTML could not do safely.
function splitChips( value ) {
	return getPlainText( value )
		.split( ',' )
		.map( ( part ) => part.trim() )
		.filter( Boolean );
}

// Roles follow the column type: an image first column, then the name.
// With badges (Preset 3) the next text column holds chips and the one
// after it a price chip; every remaining column is a labeled field.
function renderRecipes( { columns, rows, hasBadges } ) {
	const { imageCol, titleCol, restCols } = getColumnRoles( columns );

	// An image cannot be a chip, so image columns stay labeled fields.
	const chipCols = hasBadges
		? restCols.filter( ( col ) => 'image' !== col.type )
		: [];
	const statCol = chipCols[ 0 ];
	const priceCol = chipCols[ 1 ];
	const fieldCols = restCols.filter(
		( col ) => col !== statCol && col !== priceCol
	);

	return (
		<table className="moon-table__recipes">
			<tbody>
				{ rows.map( ( row, index ) => {
					if ( row.isDivider ) {
						return renderDividerRow(
							row,
							index,
							'moon-table__recipes-divider-cell'
						);
					}

					const statChips = statCol
						? splitChips( row[ statCol.key ] )
						: [];
					const priceValue = priceCol
						? getPlainText( row[ priceCol.key ] )
						: '';

					return (
						<tr
							key={ index }
							className="moon-table__recipe-card"
							data-recipe-id={ row.id }
						>
							<td className="moon-table__recipe-cell">
								<input
									type="checkbox"
									className="moon-table__recipe-check"
								/>
								<div className="moon-table__recipe-header">
									{ imageCol &&
										renderImage(
											imageCol,
											row[ imageCol.key ]
										) }
									<div className="moon-table__recipe-info">
										{ titleCol && (
											<span className="moon-table__recipe-name">
												{ renderCellValue(
													titleCol,
													row[ titleCol.key ]
												) }
											</span>
										) }
										{ ( statChips.length > 0 ||
											priceValue ) && (
											<span className="moon-table__recipe-stats">
												{ statChips.map(
													( chip, i ) => (
														<span
															key={ i }
															className="moon-table__recipe-chip moon-table__recipe-chip--accent"
														>
															{ chip }
														</span>
													)
												) }
												{ priceValue && (
													<span className="moon-table__recipe-chip">
														{ priceValue }
													</span>
												) }
											</span>
										) }
									</div>
								</div>

								{ fieldCols.map( ( col ) => {
									const value = row[ col.key ];

									if ( isBlankCell( col, value ) ) {
										return null;
									}

									return (
										<div
											key={ col.key }
											className="moon-table__recipe-field"
										>
											<span className="moon-table__recipe-field-label">
												{ col.label }
											</span>
											<span className="moon-table__recipe-field-value">
												{ renderCellValue(
													col,
													value
												) }
											</span>
										</div>
									);
								} ) }
							</td>
						</tr>
					);
				} ) }
			</tbody>
		</table>
	);
}

export default function save( { attributes } ) {
	const {
		preset,
		columns,
		rows,
		enableSort,
		enableFilter,
		showCardNote,
		showCardHighlight,
	} = attributes;

	if ( ! columns.length ) {
		return null;
	}

	const isCards = isCardPreset( preset );
	const isRecipes = isRecipePreset( preset );

	const blockProps = useBlockProps.save( {
		className: 'moon-table',
		'data-preset': preset,
		'data-sort': supportsSort( preset ) && enableSort ? 'true' : 'false',
		'data-filter': enableFilter ? 'true' : 'false',
		// The stylesheet needs the column count to keep a Default table wide
		// enough to scroll instead of squeezing its columns, and the row count
		// of a card to line up the rows of Preset 2.
		style: {
			'--moon-table-columns': columns.length,
			...( isCards && {
				'--moon-table-card-rows': getCardRowCount(
					getCardRoles( columns, {
						showCardNote,
						showCardHighlight,
					} )
				),
			} ),
		},
	} );

	let tableMarkup;

	if ( isCards ) {
		tableMarkup = renderCards( {
			columns,
			rows,
			showCardNote,
			showCardHighlight,
		} );
	} else if ( isRecipes ) {
		tableMarkup = renderRecipes( {
			columns,
			rows,
			hasBadges: PRESET_3 === preset,
		} );
	} else {
		tableMarkup = renderTable( { columns, rows, preset } );
	}

	return <div { ...blockProps }>{ tableMarkup }</div>;
}
