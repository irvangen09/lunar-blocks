import { __ } from '@wordpress/i18n';

const FOCUSABLE =
	'a[href], button, input, select, textarea, summary, [tabindex]';

// A table that scrolls sideways and holds nothing to focus cannot be
// scrolled with the keyboard in every browser, so the table itself becomes
// a stop while it overflows.
export function initScrollRegion( blockEl ) {
	if ( 'auto' !== window.getComputedStyle( blockEl ).overflowX ) {
		return;
	}

	function sync() {
		const needed =
			blockEl.scrollWidth > blockEl.clientWidth &&
			! blockEl.querySelector( FOCUSABLE );

		if ( needed ) {
			blockEl.tabIndex = 0;
			blockEl.setAttribute( 'role', 'region' );
			blockEl.setAttribute(
				'aria-label',
				__( 'Scrollable table', 'lunar-blocks' )
			);
		} else {
			blockEl.removeAttribute( 'tabindex' );
			blockEl.removeAttribute( 'role' );
			blockEl.removeAttribute( 'aria-label' );
		}
	}

	sync();

	if ( 'function' === typeof window.ResizeObserver ) {
		new window.ResizeObserver( sync ).observe( blockEl );
	}
}
