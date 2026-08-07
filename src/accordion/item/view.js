/**
 * Sets the "open" attribute on each Accordion Item based on screen width.
 * This is the only reliable approach — pure CSS tricks (display or
 * content-visibility overrides) can't be trusted in modern browsers, since
 * browsers deliberately lock the open/closed state of <details> for
 * accessibility consistency (preventing a visually "open" element while its
 * ARIA state still reads "closed" for screen reader users).
 *
 * Only loaded on the frontend (viewScript in block.json), never in the editor.
 */
( function () {
	var DESKTOP_QUERY = '(min-width: 768px)';

	function syncAccordionState( isDesktop ) {
		var items = document.querySelectorAll( '.lunar-accordion-item' );

		items.forEach( function ( item ) {
			if ( isDesktop ) {
				item.setAttribute( 'open', '' );
			} else {
				item.removeAttribute( 'open' );
			}
		} );
	}

	var mql = window.matchMedia( DESKTOP_QUERY );

	// Set the initial state as soon as the page loads.
	syncAccordionState( mql.matches );

	// Re-sync ONLY when the screen width actually crosses the breakpoint
	// (not on every resize), so a user's manual open/close state isn't
	// disturbed while still within the same mobile range.
	mql.addEventListener( 'change', function ( event ) {
		syncAccordionState( event.matches );
	} );
} )();