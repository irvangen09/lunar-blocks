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
		className: 'moon-gallery-item',
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
						<GalleryItemIcon className="moon-gallery-item__placeholder-icon" />
					}
					labels={ {
						title: __( 'Image', 'moon-blocks' ),
						instructions: __(
							'Select or upload an image for this gallery item.',
							'moon-blocks'
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
					name={ __( 'Replace image', 'moon-blocks' ) }
					mediaId={ imageId }
					mediaURL={ imageUrl }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept="image/*"
					onSelect={ onSelectImage }
				/>
				<ToolbarButton
					icon={ <CloseIcon /> }
					label={ __( 'Remove image', 'moon-blocks' ) }
					onClick={ onRemoveImage }
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Image Settings', 'moon-blocks' ) }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Alternative text', 'moon-blocks' ) }
						value={ imageAlt }
						onChange={ ( value ) =>
							setAttributes( { imageAlt: value } )
						}
						help={ __(
							'Describe the image for people who cannot see it. It applies to this gallery only, not to the Media Library.',
							'moon-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<figure { ...blockProps }>
				<img
					className="moon-gallery-item__image"
					src={ imageUrl }
					alt={ imageAlt }
				/>
				{ ( isSelected || ! RichText.isEmpty( caption ) ) && (
					<RichText
						tagName="figcaption"
						className="moon-gallery-item__caption"
						placeholder={ __(
							'Caption (optional)…',
							'moon-blocks'
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
