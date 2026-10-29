import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	MediaReplaceFlow,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { getHeadingOptions } from '../shared/heading-options';

const ALLOWED_BLOCKS = [ 'lunar-blocks/infobox-item' ];

const TEMPLATE = [
	[ 'lunar-blocks/infobox-item' ],
	[ 'lunar-blocks/infobox-item' ],
	[ 'lunar-blocks/infobox-item' ],
];

function ImagePanel( { imageAlt, setAttributes, onRemoveImage } ) {
	return (
		<PanelBody title={ __( 'Image', 'lunar-blocks' ) }>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Alternative text', 'lunar-blocks' ) }
				value={ imageAlt }
				onChange={ ( value ) => setAttributes( { imageAlt: value } ) }
				help={ __(
					'Describe the image for people who cannot see it. Leave empty if the image is only decoration.',
					'lunar-blocks'
				) }
			/>
			<Button variant="secondary" isDestructive onClick={ onRemoveImage }>
				{ __( 'Remove image', 'lunar-blocks' ) }
			</Button>
		</PanelBody>
	);
}

function Media( { imageId, imageUrl, imageAlt, onSelectImage } ) {
	return (
		<figure className="lunar-infobox__media">
			{ '' !== imageUrl ? (
				<img
					className="lunar-infobox__image"
					src={ imageUrl }
					alt={ imageAlt }
				/>
			) : (
				<div className="lunar-infobox__image-empty">
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ imageId }
							onSelect={ onSelectImage }
							render={ ( { open } ) => (
								<Button variant="secondary" onClick={ open }>
									{ __( 'Select image', 'lunar-blocks' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
					<p className="lunar-infobox__image-hint">
						{ __(
							'Optional. Without an image, the table uses the full width.',
							'lunar-blocks'
						) }
					</p>
				</div>
			) }
		</figure>
	);
}

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
						tagName={ 'none' === headingLevel ? 'p' : headingLevel }
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
