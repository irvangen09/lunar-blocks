import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';

import { columnAlignStyle, getImageWidth, headerAlignStyle } from '../utils';
import ImageCell from './image-cell';

const TEXT_CELL_FORMATS = [ 'core/bold', 'core/italic', 'core/link' ];

// The rowIndex of the header row is -1 and a divider has no column.
function Cell( { row, rowIndex, col, colIndex, actions } ) {
	const { updateCell, updateCellImage, updateCellAlt, focusCell } = actions;

	if ( 'image' === col.type ) {
		return (
			<ImageCell
				image={ row[ col.key ] }
				width={ getImageWidth( col ) }
				onSelect={ ( media ) =>
					updateCellImage( rowIndex, col.key, media )
				}
				onRemove={ () => updateCellImage( rowIndex, col.key, null ) }
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
				label={ __( 'Cell value', 'lunar-blocks' ) }
				hideLabelFromVision
				type="number"
				value={ row[ col.key ] ?? '' }
				onChange={ ( value ) => updateCell( rowIndex, col.key, value ) }
				onFocus={ () => focusCell( rowIndex, colIndex ) }
			/>
		);
	}

	return (
		<RichText
			tagName="div"
			className="lunar-table-editor__cell-text"
			aria-label={ __( 'Cell value', 'lunar-blocks' ) }
			value={ row[ col.key ] ?? '' }
			onChange={ ( value ) => updateCell( rowIndex, col.key, value ) }
			onFocus={ () => focusCell( rowIndex, colIndex ) }
			allowedFormats={ TEXT_CELL_FORMATS }
			placeholder={ __( 'Cell value', 'lunar-blocks' ) }
		/>
	);
}

function HeaderRow( { preset, columns, actions } ) {
	return (
		<tr>
			{ columns.map( ( col, colIndex ) => (
				<th key={ col.key } style={ headerAlignStyle( col, preset ) }>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Column label', 'lunar-blocks' ) }
						hideLabelFromVision
						placeholder={ __( 'Column label', 'lunar-blocks' ) }
						value={ col.label }
						onChange={ ( value ) =>
							actions.updateColumn( colIndex, { label: value } )
						}
						onFocus={ () => actions.focusCell( -1, colIndex ) }
					/>
				</th>
			) ) }
		</tr>
	);
}

function DividerRow( { row, rowIndex, columnCount, actions } ) {
	return (
		<td colSpan={ columnCount }>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Divider text', 'lunar-blocks' ) }
				hideLabelFromVision
				placeholder={ __( 'Divider text…', 'lunar-blocks' ) }
				value={ row.dividerLabel ?? '' }
				onChange={ ( value ) =>
					actions.updateRow( rowIndex, { dividerLabel: value } )
				}
				onFocus={ () => actions.focusCell( rowIndex, null ) }
			/>
		</td>
	);
}

export default function Grid( { preset, columns, rows, actions } ) {
	return (
		<table className="lunar-table-editor__grid">
			<thead>
				<HeaderRow
					preset={ preset }
					columns={ columns }
					actions={ actions }
				/>
			</thead>
			<tbody>
				{ rows.map( ( row, rowIndex ) => (
					<tr
						key={ rowIndex }
						className={
							row.isDivider
								? 'lunar-table-editor__row--divider'
								: undefined
						}
					>
						{ row.isDivider ? (
							<DividerRow
								row={ row }
								rowIndex={ rowIndex }
								columnCount={ columns.length }
								actions={ actions }
							/>
						) : (
							columns.map( ( col, colIndex ) => (
								<td
									key={ col.key }
									style={ columnAlignStyle( col, preset ) }
								>
									<Cell
										row={ row }
										rowIndex={ rowIndex }
										col={ col }
										colIndex={ colIndex }
										actions={ actions }
									/>
								</td>
							) )
						) }
					</tr>
				) ) }
			</tbody>
		</table>
	);
}
