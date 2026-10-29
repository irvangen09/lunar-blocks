const TOC = '.lunar-toc';
const LINK = '.lunar-toc__link';

// A heading counts as "current" once it has passed this fraction of the
// viewport height, measured from the top.
const CURRENT_LINE = 0.25;

function getTarget( link ) {
	let id;

	try {
		id = decodeURIComponent( link.hash.slice( 1 ) );
	} catch {
		return null;
	}

	return id ? document.getElementById( id ) : null;
}

// Headings inside a closed accordion item or an inactive tab are not
// rendered, so they cannot be the section being read.
function isShown( element ) {
	return 'function' === typeof element.checkVisibility
		? element.checkVisibility()
		: element.getClientRects().length > 0;
}

function enhance( toc ) {
	const entries = Array.from( toc.querySelectorAll( LINK ) ).map(
		( link ) => ( { link, target: getTarget( link ) } )
	);
	let current = null;

	function update() {
		const line = window.innerHeight * CURRENT_LINE;
		const shown = entries.filter(
			( { target } ) => target && isShown( target )
		);
		const atBottom =
			window.scrollY > 0 &&
			window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 2;
		let next = null;

		shown.forEach( ( entry ) => {
			const top = entry.target.getBoundingClientRect().top;

			// At the very bottom of a scrolled page the last headings may
			// never reach the line, so any heading on screen counts.
			if ( top <= line || ( atBottom && top < window.innerHeight ) ) {
				next = entry;
			}
		} );

		if ( next === current ) {
			return;
		}

		current?.link.removeAttribute( 'aria-current' );
		next?.link.setAttribute( 'aria-current', 'location' );
		current = next;
	}

	return update;
}

function init() {
	const updaters = Array.from( document.querySelectorAll( TOC ) ).map(
		enhance
	);

	if ( 0 === updaters.length ) {
		return;
	}

	let queued = false;

	function schedule() {
		if ( queued ) {
			return;
		}

		queued = true;
		window.requestAnimationFrame( () => {
			queued = false;
			updaters.forEach( ( update ) => update() );
		} );
	}

	// Clicking the link for the hash already in the address bar fires no
	// hashchange, so a closed accordion item or another tab would stay shut.
	document.addEventListener( 'click', ( event ) => {
		const link =
			event.target instanceof window.Element
				? event.target.closest( `${ TOC } ${ LINK }` )
				: null;

		if ( link && link.hash && link.hash === window.location.hash ) {
			window.dispatchEvent( new window.HashChangeEvent( 'hashchange' ) );
		}

		// Tabs change what is shown without scrolling.
		schedule();
	} );

	window.addEventListener( 'scroll', schedule, { passive: true } );
	window.addEventListener( 'resize', schedule );
	window.addEventListener( 'hashchange', schedule );
	// toggle does not bubble; capture sees accordion items opening and closing.
	document.addEventListener( 'toggle', schedule, true );

	schedule();
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
