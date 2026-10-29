import { __, sprintf } from '@wordpress/i18n';
import { createElement } from './dom';

const CHECKLIST_KEY_PREFIX = 'lunar-blocks-table:';

function nameCheckbox( checkbox, card ) {
	const name = card.querySelector( '.lunar-table__recipe-name' );
	const title = name ? name.textContent.trim() : '';

	checkbox.setAttribute(
		'aria-label',
		title
			? sprintf(
					/* translators: %s: recipe name. */
					__( 'Mark %s as obtained', 'lunar-blocks' ),
					title
				)
			: __( 'Mark as obtained', 'lunar-blocks' )
	);
}

// Storage can throw, so a card whose state cannot be read or written keeps
// working for this page view only.
function rememberChecked( checkbox, recipeId ) {
	const storageKey = CHECKLIST_KEY_PREFIX + recipeId;

	try {
		checkbox.checked = '1' === window.localStorage.getItem( storageKey );
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
}

// The checkbox is added here, not saved with the content: WordPress strips
// input elements from content saved by users who cannot post unfiltered
// HTML.
export function initChecklist( recipesEl ) {
	recipesEl.querySelectorAll( '[data-recipe-id]' ).forEach( ( card ) => {
		const cell = card.querySelector( '.lunar-table__recipe-cell' );

		if ( ! cell ) {
			return;
		}

		// Content saved before the checkbox moved here still carries one.
		let checkbox = cell.querySelector( '.lunar-table__recipe-check' );

		if ( ! checkbox ) {
			checkbox = createElement( 'input', 'lunar-table__recipe-check' );
			checkbox.type = 'checkbox';
			cell.prepend( checkbox );
		}

		nameCheckbox( checkbox, card );

		const recipeId = card.dataset.recipeId;

		if ( recipeId ) {
			rememberChecked( checkbox, recipeId );
		}
	} );
}
