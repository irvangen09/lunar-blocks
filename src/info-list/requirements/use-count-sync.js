import { __, _n, sprintf } from '@wordpress/i18n';
import { RichText, store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';

// Called at render time so translations are loaded.
export function getDefaultTitle() {
	return __( 'Requirements', 'lunar-blocks' );
}

export function getCountText( count ) {
	return sprintf(
		/* translators: %d: number of items in the list. */
		_n( '%d item', '%d items', count, 'lunar-blocks' ),
		count
	);
}

// Returns the number of items, and keeps the stored count text in step with
// it.
export default function useCountSync( {
	clientId,
	title,
	showCount,
	countText,
	setAttributes,
} ) {
	const itemCount = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ),
		[ clientId ]
	);

	const { __unstableMarkNextChangeAsNotPersistent: markNotPersistent } =
		useDispatch( blockEditorStore );

	const isTitleChecked = useRef( false );

	// Also fills the default title once when a block is inserted. The title is
	// stored as written (empty or not) and cannot be told apart from a new
	// block after a reload, so a new block is recognized by its empty count
	// text while the count is on: any block that has been in the editor with
	// the count on has stored a count text. Both writes are marked as not
	// persistent so they join the undo step of the change that caused them
	// instead of adding their own.
	useEffect( () => {
		const next = {};

		if ( ! isTitleChecked.current ) {
			isTitleChecked.current = true;

			if ( showCount && '' === countText && RichText.isEmpty( title ) ) {
				next.title = getDefaultTitle();
			}
		}

		if ( showCount && getCountText( itemCount ) !== countText ) {
			next.countText = getCountText( itemCount );
		}

		if ( Object.keys( next ).length > 0 ) {
			markNotPersistent();
			setAttributes( next );
		}
	}, [
		itemCount,
		showCount,
		countText,
		title,
		markNotPersistent,
		setAttributes,
	] );

	return itemCount;
}
