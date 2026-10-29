import { __, sprintf } from '@wordpress/i18n';

const TABS = '.lunar-tabs';
const ITEM = '.lunar-tabs-item';
const LABEL = '.lunar-tabs-item__label';
const CONTENT = '.lunar-tabs-item__content';

// Item element -> function that shows the item's tab and reports whether
// that changed the selection.
const showers = new WeakMap();

let instances = 0;

function findChild( parent, selector ) {
	return Array.from( parent.children ).find( ( child ) =>
		child.matches( selector )
	);
}

// Turns each item's label into a tab button and its content into a panel.
function collectEntries( tabsEl, index ) {
	const entries = [];

	Array.from( tabsEl.children )
		.filter( ( child ) => child.matches( ITEM ) )
		.forEach( ( item ) => {
			const label = findChild( item, LABEL );
			const panel = findChild( item, CONTENT );

			if ( ! label || ! panel ) {
				return;
			}

			const n = entries.length;
			const tab = document.createElement( 'button' );

			tab.type = 'button';
			tab.className = 'lunar-tabs__tab';
			tab.id = `lunar-tabs-${ index }-tab-${ n }`;
			tab.textContent =
				label.textContent.trim() ||
				/* translators: %d: tab number. */
				sprintf( __( 'Tab %d', 'lunar-blocks' ), n + 1 );
			tab.setAttribute( 'role', 'tab' );
			tab.setAttribute(
				'aria-controls',
				`lunar-tabs-${ index }-panel-${ n }`
			);

			label.remove();

			panel.classList.add( 'lunar-tabs__panel' );
			panel.id = `lunar-tabs-${ index }-panel-${ n }`;
			panel.tabIndex = 0;
			panel.setAttribute( 'role', 'tabpanel' );
			panel.setAttribute( 'aria-labelledby', tab.id );

			entries.push( { item, tab, panel } );
		} );

	return entries;
}

function createSelect( entries ) {
	return function select( target, focus ) {
		entries.forEach( ( entry ) => {
			const selected = entry === target;

			entry.tab.setAttribute( 'aria-selected', String( selected ) );
			entry.tab.tabIndex = selected ? 0 : -1;

			// until-found keeps hidden text reachable by find-in-page.
			if ( selected ) {
				entry.panel.removeAttribute( 'hidden' );
			} else {
				entry.panel.setAttribute( 'hidden', 'until-found' );
			}
		} );

		if ( focus ) {
			target.tab.focus();
		} else {
			target.tab.scrollIntoView?.( {
				block: 'nearest',
				inline: 'nearest',
			} );
		}
	};
}

// Index of the tab a key moves to, or null when the key does nothing.
function getTargetIndex( key, current, count, rtl ) {
	if ( 'ArrowRight' === key ) {
		return current + ( rtl ? -1 : 1 );
	}

	if ( 'ArrowLeft' === key ) {
		return current + ( rtl ? 1 : -1 );
	}

	if ( 'Home' === key ) {
		return 0;
	}

	return 'End' === key ? count - 1 : null;
}

function wireEntry( entry, i, { entries, list, select } ) {
	const { item, tab, panel } = entry;

	// Initial state: first tab selected, without scrolling the page.
	tab.setAttribute( 'aria-selected', String( 0 === i ) );
	tab.tabIndex = 0 === i ? 0 : -1;

	if ( 0 !== i ) {
		panel.setAttribute( 'hidden', 'until-found' );
	}

	showers.set( item, () => {
		if ( 'true' === tab.getAttribute( 'aria-selected' ) ) {
			return false;
		}

		select( entry, false );

		return true;
	} );

	tab.addEventListener( 'click', () => select( entry, true ) );

	// Fired when the browser reveals the panel for find-in-page.
	panel.addEventListener( 'beforematch', () => select( entry, false ) );

	tab.addEventListener( 'keydown', ( event ) => {
		if ( event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}

		const rtl = 'rtl' === window.getComputedStyle( list ).direction;
		const next = getTargetIndex( event.key, i, entries.length, rtl );

		if ( null !== next ) {
			event.preventDefault();
			select(
				entries[ ( next + entries.length ) % entries.length ],
				true
			);
		}
	} );
}

function enhance( tabsEl ) {
	const entries = collectEntries( tabsEl, instances++ );

	if ( 0 === entries.length ) {
		return;
	}

	const list = document.createElement( 'div' );

	list.className = 'lunar-tabs__list';
	list.setAttribute( 'role', 'tablist' );
	entries.forEach( ( { tab } ) => list.appendChild( tab ) );
	tabsEl.insertBefore( list, tabsEl.firstChild );
	tabsEl.classList.add( 'lunar-tabs--enhanced' );

	const context = { entries, list, select: createSelect( entries ) };

	entries.forEach( ( entry, i ) => wireEntry( entry, i, context ) );
}

// Shows the tab of every item that contains the hash target, including
// items of outer tabs.
function revealHash() {
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

	let changed = false;
	let item = target.closest( ITEM );

	while ( item ) {
		const show = showers.get( item );

		if ( show && show() ) {
			changed = true;
		}

		item = item.parentElement?.closest( ITEM );
	}

	if ( changed ) {
		target.scrollIntoView();
	}
}

function init() {
	document.querySelectorAll( TABS ).forEach( enhance );
	revealHash();
	window.addEventListener( 'hashchange', revealHash );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
