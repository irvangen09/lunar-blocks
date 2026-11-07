import { __, _n, sprintf } from '@wordpress/i18n';
import { createElement, getBodyRows, isDividerRow, toSections } from './dom';

// Searchable text is read once, without field labels, so a word such as
// "Level" does not match every card that shows that label.
function getSearchText( row ) {
	const clone = row.cloneNode( true );

	clone
		.querySelectorAll(
			'.lunar-table__card-label, .lunar-table__recipe-field-label'
		)
		.forEach( ( label ) => label.remove() );

	return clone.textContent.toLowerCase();
}

// A screen reader user cannot see rows disappear, so the number of results is
// read out. It waits until typing pauses, or every letter would interrupt the
// last announcement.
const ANNOUNCE_DELAY = 500;

function describeResults( count ) {
	if ( 0 === count ) {
		return __( 'No results for this search.', 'lunar-blocks' );
	}

	return sprintf(
		/* translators: %d: number of rows that match the search. */
		_n( '%d result', '%d results', count, 'lunar-blocks' ),
		count
	);
}

export function initFilter( tableEl, controlsEl ) {
	const searchText = new Map();

	getBodyRows( tableEl ).forEach( ( row ) => {
		if ( ! isDividerRow( row ) ) {
			searchText.set( row, getSearchText( row ) );
		}
	} );

	const wrap = createElement( 'div', 'lunar-table__filter' );
	const input = createElement( 'input', 'lunar-table__filter-input' );

	input.type = 'search';
	input.placeholder = __( 'Search this table…', 'lunar-blocks' );
	input.setAttribute(
		'aria-label',
		__( 'Search within this table', 'lunar-blocks' )
	);

	// Read out by screen readers only; the message below is for everyone else.
	const status = createElement( 'p', 'lunar-table__status' );
	const empty = createElement( 'p', 'lunar-table__filter-empty' );
	let announceTimer;

	status.setAttribute( 'role', 'status' );

	// The status already says this, so it stays out of the reading order.
	empty.setAttribute( 'aria-hidden', 'true' );
	empty.hidden = true;
	empty.textContent = describeResults( 0 );

	input.addEventListener( 'input', () => {
		const query = input.value.trim().toLowerCase();
		let matchCount = 0;

		toSections( getBodyRows( tableEl ) ).forEach( ( { divider, rows } ) => {
			let hasMatch = false;

			rows.forEach( ( row ) => {
				const matches =
					'' === query || searchText.get( row ).includes( query );

				row.hidden = ! matches;
				hasMatch = hasMatch || matches;
				matchCount += matches ? 1 : 0;
			} );

			// A heading with nothing under it would only confuse.
			if ( divider ) {
				divider.hidden = '' !== query && ! hasMatch;
			}
		} );

		clearTimeout( announceTimer );
		empty.hidden = '' === query || matchCount > 0;

		if ( '' === query ) {
			status.textContent = '';
			return;
		}

		announceTimer = setTimeout( () => {
			status.textContent = describeResults( matchCount );
		}, ANNOUNCE_DELAY );
	} );

	wrap.appendChild( input );
	wrap.appendChild( status );
	wrap.appendChild( empty );
	controlsEl.insertBefore( wrap, controlsEl.firstChild );
}
