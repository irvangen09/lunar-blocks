/**
 * Progressively enhances the plain Tabs markup (all panels visible) into
 * an interactive tab widget with full ARIA support, following the
 * WAI-ARIA APG "Tabs" pattern. If this script fails to load, the original
 * markup (all panels visible, labels as plain text) stays fully readable —
 * just without the ability to click between tabs.
 *
 * Only loaded on the frontend (viewScript in block.json), never in the editor.
 */
( function () {
	function initTabs( tabsEl, tabsIndex ) {
		var items = Array.prototype.slice.call(
			tabsEl.querySelectorAll( ':scope > .lunar-tabs-item' )
		);

		if ( items.length === 0 ) {
			return;
		}

		var tablist = document.createElement( 'div' );
		tablist.className = 'lunar-tabs__list';
		tablist.setAttribute( 'role', 'tablist' );

		items.forEach( function ( item, itemIndex ) {
			var label = item.querySelector( ':scope > .lunar-tabs-item__label' );
			var panel = item.querySelector( ':scope > .lunar-tabs-item__content' );

			if ( ! label || ! panel ) {
				return;
			}

			var tabId = 'lunar-tabs-' + tabsIndex + '-tab-' + itemIndex;
			var panelId = 'lunar-tabs-' + tabsIndex + '-panel-' + itemIndex;
			var isActive = 0 === itemIndex;

			label.classList.add( 'lunar-tabs__tab' );
			label.setAttribute( 'role', 'tab' );
			label.setAttribute( 'id', tabId );
			label.setAttribute( 'aria-controls', panelId );
			label.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
			label.setAttribute( 'tabindex', isActive ? '0' : '-1' );

			panel.classList.add( 'lunar-tabs__panel' );
			panel.setAttribute( 'role', 'tabpanel' );
			panel.setAttribute( 'id', panelId );
			panel.setAttribute( 'aria-labelledby', tabId );

			if ( ! isActive ) {
				panel.setAttribute( 'hidden', '' );
			}

			// Move the label out of its original position (above its own
			// panel) and into the new tablist strip — this is the core of
			// the progressive-enhancement transformation.
			tablist.appendChild( label );
		} );

		tabsEl.insertBefore( tablist, tabsEl.firstChild );
		tabsEl.classList.add( 'lunar-tabs--enhanced' );

		var tabs = Array.prototype.slice.call( tablist.querySelectorAll( '.lunar-tabs__tab' ) );

		function activate( tab ) {
			tabs.forEach( function ( candidate ) {
				var panel = document.getElementById( candidate.getAttribute( 'aria-controls' ) );
				var isSelected = candidate === tab;

				candidate.setAttribute( 'aria-selected', isSelected ? 'true' : 'false' );
				candidate.setAttribute( 'tabindex', isSelected ? '0' : '-1' );

				if ( panel ) {
					if ( isSelected ) {
						panel.removeAttribute( 'hidden' );
					} else {
						panel.setAttribute( 'hidden', '' );
					}
				}
			} );

			tab.focus();
		}

		tabs.forEach( function ( tab, index ) {
			tab.addEventListener( 'click', function () {
				activate( tab );
			} );

			// Left/Right arrow (+ Home/End) navigation between tabs, following
			// the WAI-ARIA APG pattern — moving focus automatically activates
			// the tab.
			tab.addEventListener( 'keydown', function ( event ) {
				var newIndex = null;

				if ( 'ArrowRight' === event.key ) {
					newIndex = ( index + 1 ) % tabs.length;
				} else if ( 'ArrowLeft' === event.key ) {
					newIndex = ( index - 1 + tabs.length ) % tabs.length;
				} else if ( 'Home' === event.key ) {
					newIndex = 0;
				} else if ( 'End' === event.key ) {
					newIndex = tabs.length - 1;
				}

				if ( null !== newIndex ) {
					event.preventDefault();
					activate( tabs[ newIndex ] );
				}
			} );
		} );
	}

	document.querySelectorAll( '.lunar-tabs' ).forEach( function ( tabsEl, index ) {
		initTabs( tabsEl, index );
	} );
} )();