import { __ } from '@wordpress/i18n';
import { createElement, getBodyRows, isDividerRow, toSections } from './dom';

// Searchable text is read once, without field labels, so a word such as
// "Level" does not match every card that shows that label.
function getSearchText( row ) {
	const clone = row.cloneNode( true );

	clone
		.querySelectorAll(
			'.moon-table__card-label, .moon-table__recipe-field-label'
		)
		.forEach( ( label ) => label.remove() );

	return clone.textContent.toLowerCase();
}

export function initFilter( tableEl, controlsEl ) {
	const searchText = new Map();

	getBodyRows( tableEl ).forEach( ( row ) => {
		if ( ! isDividerRow( row ) ) {
			searchText.set( row, getSearchText( row ) );
		}
	} );

	const wrap = createElement( 'div', 'moon-table__filter' );
	const input = createElement( 'input', 'moon-table__filter-input' );

	input.type = 'search';
	input.placeholder = __( 'Search this table…', 'moon-blocks' );
	input.setAttribute(
		'aria-label',
		__( 'Search within this table', 'moon-blocks' )
	);

	input.addEventListener( 'input', () => {
		const query = input.value.trim().toLowerCase();

		toSections( getBodyRows( tableEl ) ).forEach( ( { divider, rows } ) => {
			let hasMatch = false;

			rows.forEach( ( row ) => {
				const matches =
					'' === query || searchText.get( row ).includes( query );

				row.hidden = ! matches;
				hasMatch = hasMatch || matches;
			} );

			// A heading with nothing under it would only confuse.
			if ( divider ) {
				divider.hidden = '' !== query && ! hasMatch;
			}
		} );
	} );

	wrap.appendChild( input );
	controlsEl.insertBefore( wrap, controlsEl.firstChild );
}
