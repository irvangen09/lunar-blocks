import { __, _n, sprintf } from '@wordpress/i18n';
import {
	InnerBlocks,
	InspectorControls,
	RichText,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';

const ALLOWED_BLOCKS = [ 'lunar-blocks/info-list-requirement' ];

const TEMPLATE = [ [ 'lunar-blocks/info-list-requirement' ] ];

// Called at render time so translations are loaded.
function getDefaultTitle() {
	return __( 'Requirements', 'lunar-blocks' );
}

function getCountText( count ) {
	return sprintf(
		/* translators: %d: number of requirement items. */
		_n( '%d requirement', '%d requirements', count, 'lunar-blocks' ),
		count
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, showCount, countText } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-info-list-requirements',
	} );

	const listProps = useInnerBlocksProps(
		{ className: 'lunar-info-list-requirements__list' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	const itemCount = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ),
		[ clientId ]
	);

	const { __unstableMarkNextChangeAsNotPersistent: markNotPersistent } =
		useDispatch( blockEditorStore );

	const isTitleChecked = useRef( false );

	// Keeps the stored count text in step with the number of items, and fills
	// the default title once when a block is inserted. The title is stored
	// as written (empty or not) and cannot be told apart from a new block
	// after a reload, so a new block is recognized by its empty count text
	// while the count is on: any block that has been in the editor with the
	// count on has stored a count text. Both writes are marked as not
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

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Requirements Settings', 'lunar-blocks' ) }
				>
					<ToggleControl
						label={ __( 'Show count', 'lunar-blocks' ) }
						help={ __(
							'Shows the number of items next to the title.',
							'lunar-blocks'
						) }
						checked={ showCount }
						onChange={ ( value ) =>
							setAttributes( { showCount: value } )
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className="lunar-info-list-requirements__header">
					<RichText
						tagName="span"
						className="lunar-info-list-requirements__title"
						value={ title }
						onChange={ ( value ) =>
							setAttributes( { title: value } )
						}
						allowedFormats={ [] }
						disableLineBreaks
						placeholder={ getDefaultTitle() }
						aria-label={ __(
							'Requirements title',
							'lunar-blocks'
						) }
					/>
					{ showCount && (
						<span className="lunar-info-list-requirements__count">
							{ getCountText( itemCount ) }
						</span>
					) }
				</div>
				<div className="lunar-info-list-requirements__body">
					<div { ...listProps } />
				</div>
			</div>
		</>
	);
}
