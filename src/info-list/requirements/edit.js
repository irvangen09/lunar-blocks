import { __ } from '@wordpress/i18n';
import {
	InnerBlocks,
	InspectorControls,
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import requirementMetadata from './requirement/block.json';
import useCountSync, { getCountText, getDefaultTitle } from './use-count-sync';

const ALLOWED_BLOCKS = [ requirementMetadata.name ];

const TEMPLATE = [ [ requirementMetadata.name ] ];

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

	const itemCount = useCountSync( {
		clientId,
		title,
		showCount,
		countText,
		setAttributes,
	} );

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
