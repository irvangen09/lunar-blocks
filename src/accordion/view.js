import { __, sprintf } from '@wordpress/i18n';
import { MOBILE_BREAKPOINT } from '../shared/breakpoint';

const ACCORDION = '.lunar-accordion--open-desktop';
const ITEM = '.lunar-accordion-item';

function syncItems( isDesktop ) {
	document
		.querySelectorAll( `${ ACCORDION } > ${ ITEM }` )
		.forEach( ( item ) => {
			item.open = isDesktop;
		} );
}

// Opens every item that contains the hash target, including nested ones.
function openFromHash() {
	let id;

	try {
		id = decodeURIComponent( window.location.hash.slice( 1 ) );
	} catch {
		return;
	}

	const target = id ? document.getElementById( id ) : null;

	if ( ! target ) {
		return;
	}

	let opened = false;
	let item = target.closest( ITEM );

	while ( item ) {
		if ( ! item.open ) {
			item.open = true;
			opened = true;
		}

		item = item.parentElement?.closest( ITEM );
	}

	if ( opened ) {
		target.scrollIntoView();
	}
}

// An item without a title would be announced as an empty button.
function nameEmptySummaries() {
	document.querySelectorAll( '.lunar-accordion' ).forEach( ( accordion ) => {
		accordion
			.querySelectorAll( `:scope > ${ ITEM } > summary` )
			.forEach( ( summary, position ) => {
				if ( '' !== summary.textContent.trim() ) {
					return;
				}

				const name = sprintf(
					/* translators: %d: item number. */
					__( 'Section %d', 'lunar-blocks' ),
					position + 1
				);

				// The title may be a heading, which needs the name itself.
				const title =
					summary.querySelector( '.lunar-accordion-item__title' ) ||
					summary;

				title.setAttribute( 'aria-label', name );
			} );
	} );
}

function init() {
	nameEmptySummaries();

	const desktop = window.matchMedia(
		`(min-width: ${ MOBILE_BREAKPOINT + 1 }px)`
	);

	syncItems( desktop.matches );
	openFromHash();

	document
		.querySelectorAll( ACCORDION )
		.forEach( ( accordion ) =>
			accordion.classList.add( 'lunar-accordion--ready' )
		);

	// Sync only when crossing the breakpoint, so a visitor's own
	// open/close choices survive resizes within the same range.
	desktop.addEventListener( 'change', ( event ) => {
		syncItems( event.matches );
	} );

	window.addEventListener( 'hashchange', openFromHash );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
