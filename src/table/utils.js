export const PRESET_DEFAULT = 'default';
export const PRESET_1 = 'preset-1';
export const PRESET_2 = 'preset-2';
export const PRESET_3 = 'preset-3';
export const PRESET_4 = 'preset-4';

// Width in pixels of an image column that has no width set.
export const DEFAULT_IMAGE_WIDTH = 48;

// Default and Preset 1 render a real table with a header row.
export function isTablePreset( preset ) {
	return PRESET_DEFAULT === preset || PRESET_1 === preset;
}

export function isCardPreset( preset ) {
	return PRESET_2 === preset;
}

// Preset 3 and Preset 4 share one markup path and one checklist.
export function isRecipePreset( preset ) {
	return PRESET_3 === preset || PRESET_4 === preset;
}

// Alignment only has a visible effect where a header row and columns
// exist. Card layouts have no column grid to align.
export function supportsAlignment( preset ) {
	return isTablePreset( preset );
}

export function columnAlignStyle( col, preset ) {
	if ( ! supportsAlignment( preset ) || ! col.align ) {
		return undefined;
	}

	return { textAlign: col.align };
}

// Default headers follow the body (left); Preset 1 centers them. An
// alignment set on the column overrides both.
export function headerAlignStyle( col, preset ) {
	return (
		columnAlignStyle( col, preset ) ?? {
			textAlign: PRESET_1 === preset ? 'center' : 'left',
		}
	);
}

// A value that can be sorted carries the key of its column. Image columns
// cannot be sorted, and a missing column (a card with no title column) has
// nothing to carry.
export function getSortProps( col, sortable ) {
	if ( ! sortable || ! col || 'image' === col.type ) {
		return undefined;
	}

	return { 'data-key': col.key };
}

// The columns a card layout can sort by, in column order.
export function getSortColumns( columns ) {
	return columns
		.filter( ( col ) => 'image' !== col.type )
		.map( ( { key, label, type } ) => ( { key, label, type } ) );
}

export function getImageWidth( col ) {
	return col.imageWidth || DEFAULT_IMAGE_WIDTH;
}

// Roles follow the column type, not its position: an image role exists
// only when the first column is an image, and the title is the first
// column after it. Every other column is a detail.
export function getColumnRoles( columns ) {
	const imageCol = 'image' === columns[ 0 ]?.type ? columns[ 0 ] : undefined;
	const rest = imageCol ? columns.slice( 1 ) : [ ...columns ];

	return {
		imageCol,
		titleCol: rest[ 0 ],
		restCols: rest.slice( 1 ),
	};
}

// Preset 2 splits the detail columns into an optional header note (the
// first one), an optional highlight band (the last one) and the rows
// in between. A toggle has no effect when no column is left for it.
export function getCardRoles( columns, { showCardNote, showCardHighlight } ) {
	const { imageCol, titleCol, restCols } = getColumnRoles( columns );
	const pool = [ ...restCols ];

	const noteCol = showCardNote && pool.length ? pool.shift() : undefined;
	const highlightCol =
		showCardHighlight && pool.length ? pool.pop() : undefined;

	return {
		imageCol,
		titleCol,
		noteCol,
		highlightCol,
		detailCols: pool,
	};
}

// Header row, one row per detail, and the highlight band. Every card
// in a table has the same count, which lets the grid line rows up.
export function getCardRowCount( { detailCols, highlightCol } ) {
	return 1 + detailCols.length + ( highlightCol ? 1 : 0 );
}

// Text of a rich-text cell with its tags removed. A cell that holds an
// image object, left over from a column type change, has no text.
export function getPlainText( value ) {
	if ( 'object' === typeof value ) {
		return '';
	}

	return String( value ?? '' )
		.replace( /<br\s*\/?>/gi, ' ' )
		.replace( /<[^>]*>/g, '' )
		.replace( /&nbsp;/gi, ' ' )
		.trim();
}

export function isBlankCell( col, value ) {
	if ( 'image' === col.type ) {
		return ! value?.url;
	}

	return '' === getPlainText( value );
}

// A cell holding only "N/A" is shown muted, like an empty one.
export function isNotApplicable( col, value ) {
	return (
		'image' !== col.type && 'N/A' === getPlainText( value ).toUpperCase()
	);
}
