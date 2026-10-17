import { __, sprintf } from '@wordpress/i18n';

const BLOCK = '.moon-table';
const SVG_NS = 'http://www.w3.org/2000/svg';
const CHECKLIST_KEY_PREFIX = 'moon-blocks-table:';

// Without this file the table still renders fully and stays readable;
// it only adds sort, search and the recipe checklist.

function createElement( tag, className ) {
	const element = document.createElement( tag );

	element.className = className;

	return element;
}

// Each entry is [ path data, optional class name ].
function createIcon( paths ) {
	const svg = document.createElementNS( SVG_NS, 'svg' );

	svg.setAttribute( 'viewBox', '0 0 24 24' );
	svg.setAttribute( 'fill', 'none' );
	svg.setAttribute( 'stroke', 'currentColor' );
	svg.setAttribute( 'stroke-width', '2' );
	svg.setAttribute( 'stroke-linecap', 'round' );
	svg.setAttribute( 'stroke-linejoin', 'round' );
	svg.setAttribute( 'aria-hidden', 'true' );
	svg.setAttribute( 'focusable', 'false' );

	paths.forEach( ( [ d, name ] ) => {
		const path = document.createElementNS( SVG_NS, 'path' );

		path.setAttribute( 'd', d );

		if ( name ) {
			path.setAttribute( 'class', name );
		}

		svg.appendChild( path );
	} );

	return svg;
}

function getBodyRows( tableEl ) {
	return tableEl.tBodies[ 0 ] ? [ ...tableEl.tBodies[ 0 ].rows ] : [];
}

function isDividerRow( row ) {
	return row.classList.contains( 'moon-table__row--divider' );
}

// A divider heads the rows that follow it. Rows before the first
// divider form a section without a heading.
function toSections( rows ) {
	const sections = [ { divider: null, rows: [] } ];

	rows.forEach( ( row ) => {
		if ( isDividerRow( row ) ) {
			sections.push( { divider: row, rows: [] } );
		} else {
			sections[ sections.length - 1 ].rows.push( row );
		}
	} );

	return sections;
}

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

function initSort( blockEl, tableEl, controlsEl ) {
	const sortableHeaders = [
		...tableEl.querySelectorAll( 'thead th' ),
	].filter( ( th ) => 'image' !== th.dataset.type );

	if ( ! sortableHeaders.length ) {
		return;
	}

	// Recorded now, so a third click can bring the saved order back.
	const originalRows = getBodyRows( tableEl );
	let sort = null;
	let select = null;
	let directionButton = null;

	function applySort( next ) {
		sort = next;

		sortBody( tableEl, originalRows, sort );
		markSortedCells( tableEl, sort );

		sortableHeaders.forEach( ( th ) => {
			let state = 'none';

			if ( sort && th.dataset.key === sort.key ) {
				state = 'asc' === sort.direction ? 'ascending' : 'descending';
			}

			th.setAttribute( 'aria-sort', state );
		} );

		if ( select ) {
			select.value = sort ? sort.key : '';
			directionButton.disabled = ! sort;
			directionButton.setAttribute(
				'aria-pressed',
				sort && 'desc' === sort.direction ? 'true' : 'false'
			);
		}
	}

	// Each click moves one step: ascending, descending, original order.
	sortableHeaders.forEach( ( th ) => {
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
	} );

	// Preset 1 hides its header on small screens, so it gets a select and
	// a direction button that share the same sort state.
	if ( 'preset-1' !== blockEl.dataset.preset ) {
		return;
	}

	const bar = createElement( 'div', 'moon-table__sort-bar' );

	select = createElement( 'select', 'moon-table__sort-select' );
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

	directionButton = createElement( 'button', 'moon-table__sort-direction' );
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
		if ( sort ) {
			applySort( {
				...sort,
				direction: 'asc' === sort.direction ? 'desc' : 'asc',
			} );
		}
	} );

	bar.appendChild( select );
	bar.appendChild( directionButton );
	controlsEl.appendChild( bar );
}

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

function initFilter( tableEl, controlsEl ) {
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

// The checkbox is native, so it works without this file; only saving the
// ticks needs it. Storage can throw (blocked by browser settings), and
// the checkbox then works for this page view only.
function initChecklist( recipesEl ) {
	recipesEl
		.querySelectorAll( '.moon-table__recipe-check' )
		.forEach( ( checkbox ) => {
			const card = checkbox.closest( '[data-recipe-id]' );
			const name = card?.querySelector( '.moon-table__recipe-name' );
			const title = name ? name.textContent.trim() : '';

			checkbox.setAttribute(
				'aria-label',
				title
					? sprintf(
							/* translators: %s: recipe name. */
							__( 'Mark %s as obtained', 'moon-blocks' ),
							title
						)
					: __( 'Mark as obtained', 'moon-blocks' )
			);

			const recipeId = card?.dataset.recipeId;

			if ( ! recipeId ) {
				return;
			}

			const storageKey = CHECKLIST_KEY_PREFIX + recipeId;

			try {
				checkbox.checked =
					'1' === window.localStorage.getItem( storageKey );
			} catch {
				return;
			}

			checkbox.addEventListener( 'change', () => {
				try {
					if ( checkbox.checked ) {
						window.localStorage.setItem( storageKey, '1' );
					} else {
						window.localStorage.removeItem( storageKey );
					}
				} catch {
					// Not saved; see above.
				}
			} );
		} );
}

function initBlock( blockEl ) {
	const tableEl = blockEl.querySelector(
		'.moon-table__table, .moon-table__cards, .moon-table__recipes'
	);

	if ( ! tableEl ) {
		return;
	}

	const controlsEl = createElement( 'div', 'moon-table__controls' );
	const isTable = tableEl.classList.contains( 'moon-table__table' );

	if ( isTable && 'true' === blockEl.dataset.sort ) {
		initSort( blockEl, tableEl, controlsEl );
	}

	if ( 'true' === blockEl.dataset.filter ) {
		initFilter( tableEl, controlsEl );
	}

	if ( controlsEl.hasChildNodes() ) {
		blockEl.insertBefore( controlsEl, tableEl );
	}

	if ( tableEl.classList.contains( 'moon-table__recipes' ) ) {
		initChecklist( tableEl );
	}
}

function init() {
	document.querySelectorAll( BLOCK ).forEach( initBlock );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
