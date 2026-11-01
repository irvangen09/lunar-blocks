import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	MediaReplaceFlow,
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { getHeadingOptions, getTitleTagName } from '../shared/heading-options';
import ImagePanel from './image-panel';
import Media from './media';
import itemMetadata from './item/block.json';

const ALLOWED_BLOCKS = [ itemMetadata.name ];

const TEMPLATE = [
	[ itemMetadata.name ],
	[ itemMetadata.name ],
	[ itemMetadata.name ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { title, headingLevel, imageId, imageUrl, imageAlt } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-infobox',
	} );

	const rowsProps = useInnerBlocksProps(
		{ className: 'lunar-infobox__rows' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	const hasImage = '' !== imageUrl;

	const onSelectImage = ( media ) => {
		if ( ! media || ! media.url ) {
			return;
		}

		// A large size is plenty for the frame; WordPress adds a srcset on output.
		setAttributes( {
			imageId: media.id,
			imageUrl: media.sizes?.large?.url || media.url,
			imageAlt: media.alt || '',
		} );
	};

	const onRemoveImage = () => {
		setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } );
	};

	return (
		<>
			{ hasImage && (
				<BlockControls group="other">
					<MediaReplaceFlow
						name={ __( 'Replace image', 'lunar-blocks' ) }
						mediaId={ imageId }
						mediaURL={ imageUrl }
						allowedTypes={ [ 'image' ] }
						accept="image/*"
						onSelect={ onSelectImage }
					/>
				</BlockControls>
			) }

			<InspectorControls>
				<PanelBody title={ __( 'Title Settings', 'lunar-blocks' ) }>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Heading Level', 'lunar-blocks' ) }
						value={ headingLevel }
						options={ getHeadingOptions() }
						onChange={ ( value ) =>
							setAttributes( { headingLevel: value } )
						}
						help={ __(
							'The heading level shapes the heading structure of the page. Choose a level that fits the surrounding content, or no heading for a plain label.',
							'lunar-blocks'
						) }
					/>
				</PanelBody>
				{ hasImage && (
					<ImagePanel
						imageAlt={ imageAlt }
						setAttributes={ setAttributes }
						onRemoveImage={ onRemoveImage }
					/>
				) }
			</InspectorControls>

			<div { ...blockProps }>
				<Media
					imageId={ imageId }
					imageUrl={ imageUrl }
					imageAlt={ imageAlt }
					onSelectImage={ onSelectImage }
				/>

				<div className="lunar-infobox__body">
					<RichText
						tagName={ getTitleTagName( headingLevel, 'p' ) }
						className="lunar-infobox__title"
						placeholder={ __( 'Infobox title…', 'lunar-blocks' ) }
						value={ title }
						onChange={ ( value ) =>
							setAttributes( { title: value } )
						}
						allowedFormats={ [] }
						disableLineBreaks
					/>
					<div { ...rowsProps } />
				</div>
			</div>
		</>
	);
}
