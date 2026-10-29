import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextareaControl,
	ToolbarButton,
} from '@wordpress/components';
import { CloseIcon, GalleryItemIcon } from '../icons';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { imageId, imageUrl, imageAlt, caption } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-gallery-item',
	} );

	const onSelectImage = ( media ) => {
		if ( ! media || ! media.url ) {
			return;
		}

		setAttributes( {
			imageId: media.id || 0,
			imageUrl: media.url,
			imageAlt: media.alt || '',
		} );
	};

	const onRemoveImage = () => {
		setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } );
	};

	if ( ! imageUrl ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon={
						<GalleryItemIcon className="lunar-gallery-item__placeholder-icon" />
					}
					labels={ {
						title: __( 'Image', 'lunar-blocks' ),
						instructions: __(
							'Select or upload an image for this gallery item.',
							'lunar-blocks'
						),
					} }
					onSelect={ onSelectImage }
					accept="image/*"
					allowedTypes={ ALLOWED_MEDIA_TYPES }
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					name={ __( 'Replace image', 'lunar-blocks' ) }
					mediaId={ imageId }
					mediaURL={ imageUrl }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept="image/*"
					onSelect={ onSelectImage }
				/>
				<ToolbarButton
					icon={ <CloseIcon /> }
					label={ __( 'Remove image', 'lunar-blocks' ) }
					onClick={ onRemoveImage }
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Image Settings', 'lunar-blocks' ) }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Alternative text', 'lunar-blocks' ) }
						value={ imageAlt }
						onChange={ ( value ) =>
							setAttributes( { imageAlt: value } )
						}
						help={ __(
							'Describe the image for people who cannot see it. It applies to this gallery only, not to the Media Library.',
							'lunar-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<figure { ...blockProps }>
				<img
					className="lunar-gallery-item__image"
					src={ imageUrl }
					alt={ imageAlt }
				/>
				{ ( isSelected || ! RichText.isEmpty( caption ) ) && (
					<RichText
						tagName="figcaption"
						className="lunar-gallery-item__caption"
						placeholder={ __(
							'Caption (optional)…',
							'lunar-blocks'
						) }
						value={ caption }
						onChange={ ( value ) =>
							setAttributes( { caption: value } )
						}
						allowedFormats={ [] }
					/>
				) }
			</figure>
		</>
	);
}
