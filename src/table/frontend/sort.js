import { __, sprintf } from '@wordpress/i18n';
import { MOBILE_BREAKPOINT } from '../../shared/breakpoint';
import {
	createElement,
	createIcon,
	getBodyRows,
	isDividerRow,
	toSections,
} from './dom';
import { isNoValue, isNumericColumn, parseLeadingNumber } from './number';

// A table cell holds one column; a card holds its values in elements that
// carry the key, and a column can show as several chips. A muted dash stands
// for an empty or "N/A" value, so it counts as empty.
function readCellText( row, key ) {
	return [ ...row.querySelectorAll( '[data-key]' ) ]
		.filter(
			( el ) =>
				el.dataset.key === key &&
				! el.classList.contains( 'moon-table__card-value--muted' )
		)
		.map( ( el ) => el.textContent.trim() )
		.join( ', ' );
}

// Rows never change their text, so each value is read once.
const cellTexts = new WeakMap();

function getCellText( row, key ) {
	if ( ! cellTexts.has( row ) ) {
		cellTexts.set( row, new Map() );
	}

	const texts = cellTexts.get( row );

	if ( ! texts.has( key ) ) {
		texts.set( key, readCellText( row, key ) );
	}

	return texts.get( key );
}

// Empty cells go last in both directions. Amounts sort by their value; the
// text breaks a tie, so equal amounts still come out in a stable order.
function compareRows( a, b, { key, direction }, numeric ) {
	const aText = getCellText( a, key );
	const bText = getCellText( b, key );
	const aValue = numeric ? parseLeadingNumber( aText ) : aText;
	const bValue = numeric ? parseLeadingNumber( bText ) : bText;
	const aEmpty = null === aValue || '' === aValue || isNoValue( aText );
	const bEmpty = null === bValue || '' === bValue || isNoValue( bText );

	if ( aEmpty || bEmpty ) {
		return Number( aEmpty ) - Number( bEmpty );
	}

	const byText = aText.localeCompare( bText, undefined, {
		numeric: true,
		sensitivity: 'base',
	} );
	const result = numeric ? aValue - bValue || byText : byText;

	return 'desc' === direction ? -result : result;
}

// Sort stays inside each divider section, so the groups a divider keeps
// apart are never mixed. Sections are rebuilt from the original order,
// which keeps equal values in their saved order.
function sortBody( tableEl, originalRows, sort ) {
	const tbody = tableEl.tBodies[ 0 ];

	if ( ! sort ) {
		originalRows.forEach( ( row ) => tbody.appendChild( row ) );
		return;
	}

	// A column of amounts is decided once, from every row, not per section.
	const numeric =
		'number' === sort.type ||
		isNumericColumn(
			originalRows
				.filter( ( row ) => ! isDividerRow( row ) )
				.map( ( row ) => getCellText( row, sort.key ) )
		);

	toSections( originalRows ).forEach( ( { divider, rows } ) => {
		if ( divider ) {
			tbody.appendChild( divider );
		}

		[ ...rows ]
			.sort( ( a, b ) => compareRows( a, b, sort, numeric ) )
			.forEach( ( row ) => tbody.appendChild( row ) );
	} );
}

function markSortedCells( tableEl, sort ) {
	tableEl.querySelectorAll( 'td[data-key]' ).forEach( ( cell ) => {
		cell.classList.toggle(
			'moon-table__cell--sorted',
			!! sort && cell.dataset.key === sort.key
		);
	} );
}

function getAriaSort( th, sort ) {
	if ( ! sort || th.dataset.key !== sort.key ) {
		return 'none';
	}

	return 'asc' === sort.direction ? 'ascending' : 'descending';
}

// Each click moves one step: ascending, descending, original order.
function addHeaderButton( th, getSort, applySort ) {
	const button = createElement( 'button', 'moon-table__sort' );
	const label = createElement( 'span', 'moon-table__sort-label' );

	button.type = 'button';
	label.textContent = th.textContent;

	button.appendChild( label );
	button.appendChild(
		createIcon( [
			[ 'M8 10l4-4 4 4', 'moon-table__sort-up' ],
			[ 'M8 14l4 4 4-4', 'moon-table__sort-down' ],
		] )
	);

	th.textContent = '';
	th.appendChild( button );
	th.setAttribute( 'aria-sort', 'none' );

	button.addEventListener( 'click', () => {
		const sort = getSort();
		const key = th.dataset.key;
		const current = sort && sort.key === key ? sort.direction : null;

		if ( 'desc' === current ) {
			applySort( null );
			return;
		}

		applySort( {
			key,
			type: th.dataset.type,
			direction: 'asc' === current ? 'desc' : 'asc',
		} );
	} );
}

// Preset 1 hides its header on small screens, so it gets a select and a
// direction button that share the same sort state.
function createSortBar( columns, getSort, applySort ) {
	const element = createElement( 'div', 'moon-table__sort-bar' );
	const select = createElement( 'select', 'moon-table__sort-select' );
	const directionButton = createElement(
		'button',
		'moon-table__sort-direction'
	);

	select.setAttribute( 'aria-label', __( 'Sort by', 'moon-blocks' ) );

	const original = document.createElement( 'option' );

	original.value = '';
	original.textContent = __( 'Original order', 'moon-blocks' );
	select.appendChild( original );

	columns.forEach( ( col ) => {
		const option = document.createElement( 'option' );

		option.value = col.key;
		option.textContent = sprintf(
			/* translators: %s: column name. */
			__( 'Sort: %s', 'moon-blocks' ),
			col.label
		);
		select.appendChild( option );
	} );

	directionButton.type = 'button';
	directionButton.disabled = true;
	directionButton.setAttribute( 'aria-pressed', 'false' );
	directionButton.setAttribute(
		'aria-label',
		__( 'Descending order', 'moon-blocks' )
	);
	directionButton.appendChild(
		createIcon( [ [ 'M12 19V5' ], [ 'M6 11l6-6 6 6' ] ] )
	);

	select.addEventListener( 'change', () => {
		const col = columns.find( ( c ) => c.key === select.value );

		applySort(
			col ? { key: col.key, type: col.type, direction: 'asc' } : null
		);
	} );

	directionButton.addEventListener( 'click', () => {
		const sort = getSort();

		if ( sort ) {
			applySort( {
				...sort,
				direction: 'asc' === sort.direction ? 'desc' : 'asc',
			} );
		}
	} );

	element.appendChild( select );
	element.appendChild( directionButton );

	return {
		element,
		update( sort ) {
			select.value = sort ? sort.key : '';
			directionButton.disabled = ! sort;
			directionButton.setAttribute(
				'aria-pressed',
				sort && 'desc' === sort.direction ? 'true' : 'false'
			);
		},
	};
}

// The header buttons are invisible on small screens and the bar replaces
// them, so keyboard focus skips them there.
function skipHeaderButtonsOnSmallScreens( tableEl ) {
	const smallScreen = window.matchMedia(
		`(max-width: ${ MOBILE_BREAKPOINT }px)`
	);
	const headerButtons = tableEl.querySelectorAll( 'thead .moon-table__sort' );

	function sync() {
		headerButtons.forEach( ( button ) => {
			if ( smallScreen.matches ) {
				button.tabIndex = -1;
			} else {
				button.removeAttribute( 'tabindex' );
			}
		} );
	}

	sync();
	smallScreen.addEventListener( 'change', sync );
}

// Default and Preset 1 read their columns from the header row. Card layouts
// have none, so they save their columns on the block.
function getSortColumns( blockEl, headers ) {
	if ( headers.length ) {
		return headers.map( ( th ) => ( {
			key: th.dataset.key,
			label: th.textContent,
			type: th.dataset.type,
		} ) );
	}

	try {
		const columns = JSON.parse( blockEl.dataset.columns );

		return Array.isArray( columns ) ? columns : [];
	} catch {
		return [];
	}
}

export function initSort( blockEl, tableEl, controlsEl ) {
	const headers = [ ...tableEl.querySelectorAll( 'thead th' ) ].filter(
		( th ) => 'image' !== th.dataset.type
	);
	const columns = getSortColumns( blockEl, headers );

	if ( ! columns.length ) {
		return;
	}

	// Recorded now, so a third click can bring the saved order back.
	const originalRows = getBodyRows( tableEl );
	let sort = null;
	let bar = null;

	function applySort( next ) {
		sort = next;

		sortBody( tableEl, originalRows, sort );
		markSortedCells( tableEl, sort );

		headers.forEach( ( th ) =>
			th.setAttribute( 'aria-sort', getAriaSort( th, sort ) )
		);

		if ( bar ) {
			bar.update( sort );
		}
	}

	const getSort = () => sort;

	headers.forEach( ( th ) => addHeaderButton( th, getSort, applySort ) );

	// A table with a header row sorts there; the bar is for the layouts that
	// have none, and for Preset 1 on small screens, where its header is hidden.
	if ( headers.length && 'preset-1' !== blockEl.dataset.preset ) {
		return;
	}

	bar = createSortBar( columns, getSort, applySort );
	controlsEl.appendChild( bar.element );

	if ( headers.length ) {
		skipHeaderButtonsOnSmallScreens( tableEl );
	}
}
