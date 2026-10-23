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

const ALLOWED_BLOCKS = [ 'moon-blocks/infobox-item' ];

const TEMPLATE = [
	[ 'moon-blocks/infobox-item' ],
	[ 'moon-blocks/infobox-item' ],
	[ 'moon-blocks/infobox-item' ],
];

function ImagePanel( { imageAlt, setAttributes, onRemoveImage } ) {
	return (
		<PanelBody title={ __( 'Image', 'moon-blocks' ) }>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Alternative text', 'moon-blocks' ) }
				value={ imageAlt }
				onChange={ ( value ) => setAttributes( { imageAlt: value } ) }
				help={ __(
					'Describe the image for people who cannot see it. Leave empty if the image is only decoration.',
					'moon-blocks'
				) }
			/>
			<Button variant="secondary" isDestructive onClick={ onRemoveImage }>
				{ __( 'Remove image', 'moon-blocks' ) }
			</Button>
		</PanelBody>
	);
}

function Media( { imageId, imageUrl, imageAlt, onSelectImage } ) {
	return (
		<figure className="moon-infobox__media">
			{ '' !== imageUrl ? (
				<img
					className="moon-infobox__image"
					src={ imageUrl }
					alt={ imageAlt }
				/>
			) : (
				<div className="moon-infobox__image-empty">
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ imageId }
							onSelect={ onSelectImage }
							render={ ( { open } ) => (
								<Button variant="secondary" onClick={ open }>
									{ __( 'Select image', 'moon-blocks' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
					<p className="moon-infobox__image-hint">
						{ __(
							'Optional. Without an image, the table uses the full width.',
							'moon-blocks'
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
		className: 'moon-infobox',
	} );

	const rowsProps = useInnerBlocksProps(
		{ className: 'moon-infobox__rows' },
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
						name={ __( 'Replace image', 'moon-blocks' ) }
						mediaId={ imageId }
						mediaURL={ imageUrl }
						allowedTypes={ [ 'image' ] }
						accept="image/*"
						onSelect={ onSelectImage }
					/>
				</BlockControls>
			) }

			<InspectorControls>
				<PanelBody title={ __( 'Title Settings', 'moon-blocks' ) }>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Heading Level', 'moon-blocks' ) }
						value={ headingLevel }
						options={ getHeadingOptions() }
						onChange={ ( value ) =>
							setAttributes( { headingLevel: value } )
						}
						help={ __(
							'The heading level shapes the heading structure of the page. Choose a level that fits the surrounding content, or no heading for a plain label.',
							'moon-blocks'
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

				<div className="moon-infobox__body">
					<RichText
						tagName={ 'none' === headingLevel ? 'p' : headingLevel }
						className="moon-infobox__title"
						placeholder={ __( 'Infobox title…', 'moon-blocks' ) }
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
