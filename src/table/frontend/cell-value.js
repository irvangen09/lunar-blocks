import { createElement } from './dom';

// Preset 1 turns each row into a card on small screens, with the label drawn
// by CSS beside the cell's own content. That content is loose text and inline
// elements, which CSS cannot center against the label when the label is the
// taller of the two. Wrapping it in one element gives CSS a box to center.
export function wrapCellValues( tableEl ) {
	tableEl
		.querySelectorAll(
			'td[data-label]:not(.moon-table__cell--lead):not(.moon-table__cell--title)'
		)
		.forEach( ( cell ) => {
			const value = createElement( 'span', 'moon-table__cell-value' );

			while ( cell.firstChild ) {
				value.appendChild( cell.firstChild );
			}

			cell.appendChild( value );
		} );
}
