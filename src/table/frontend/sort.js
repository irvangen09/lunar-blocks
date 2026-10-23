import { __, sprintf } from '@wordpress/i18n';
import { MOBILE_BREAKPOINT } from '../../shared/breakpoint';
import { createElement, createIcon, getBodyRows, toSections } from './dom';

function getCellText( row, key ) {
	const cell = [ ...row.cells ].find( ( c ) => c.dataset.key === key );

	return cell ? cell.textContent.trim() : '';
}

function parseNumber( text ) {
	const number = parseFloat( text.replace( /,/g, '' ) );

	return Number.isNaN( number ) ? null : number;
}

// Empty cells go last in both directions.
function compareRows( a, b, { key, type, direction } ) {
	const aText = getCellText( a, key );
	const bText = getCellText( b, key );
	const aValue = 'number' === type ? parseNumber( aText ) : aText;
	const bValue = 'number' === type ? parseNumber( bText ) : bText;
	const aEmpty = null === aValue || '' === aValue;
	const bEmpty = null === bValue || '' === bValue;

	if ( aEmpty || bEmpty ) {
		return Number( aEmpty ) - Number( bEmpty );
	}

	const result =
		'number' === type
			? aValue - bValue
			: aValue.localeCompare( bValue, undefined, {
					numeric: true,
					sensitivity: 'base',
				} );

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

	toSections( originalRows ).forEach( ( { divider, rows } ) => {
		if ( divider ) {
			tbody.appendChild( divider );
		}

		[ ...rows ]
			.sort( ( a, b ) => compareRows( a, b, sort ) )
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
function createSortBar( sortableHeaders, getSort, applySort ) {
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

	sortableHeaders.forEach( ( th ) => {
		const option = document.createElement( 'option' );

		option.value = th.dataset.key;
		option.textContent = sprintf(
			/* translators: %s: column name. */
			__( 'Sort: %s', 'moon-blocks' ),
			th.textContent
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
		const th = sortableHeaders.find(
			( h ) => h.dataset.key === select.value
		);

		applySort(
			th
				? {
						key: th.dataset.key,
						type: th.dataset.type,
						direction: 'asc',
					}
				: null
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

export function initSort( blockEl, tableEl, controlsEl ) {
	const sortableHeaders = [
		...tableEl.querySelectorAll( 'thead th' ),
	].filter( ( th ) => 'image' !== th.dataset.type );

	if ( ! sortableHeaders.length ) {
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

		sortableHeaders.forEach( ( th ) =>
			th.setAttribute( 'aria-sort', getAriaSort( th, sort ) )
		);

		if ( bar ) {
			bar.update( sort );
		}
	}

	const getSort = () => sort;

	sortableHeaders.forEach( ( th ) =>
		addHeaderButton( th, getSort, applySort )
	);

	if ( 'preset-1' !== blockEl.dataset.preset ) {
		return;
	}

	bar = createSortBar( sortableHeaders, getSort, applySort );
	controlsEl.appendChild( bar.element );

	skipHeaderButtonsOnSmallScreens( tableEl );
}
