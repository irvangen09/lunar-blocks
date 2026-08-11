import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	RichText,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';

const closeIcon = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M13.06 12l6.47-6.47-1.06-1.06L12 10.94l-6.47-6.47-1.06 1.06L10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12z" />
	</svg>
);

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { imageId, imageUrl, imageAlt, caption } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-gallery-item',
	} );

	const onSelectImage = ( media ) => {
		if ( ! media || ! media.url ) {
			setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } );
			return;
		}

		setAttributes( {
			imageId: media.id,
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
					icon="format-image"
					labels={ {
						title: __( 'Image', 'lunar-blocks' ),
						instructions: __(
							'Select or upload an image for this gallery item.',
							'lunar-blocks'
						),
					} }
					onSelect={ onSelectImage }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<MediaReplaceFlow
					mediaId={ imageId }
					mediaURL={ imageUrl }
					allowedTypes={ [ 'image' ] }
					accept="image/*"
					onSelect={ onSelectImage }
				/>
				<ToolbarGroup>
					<ToolbarButton
						icon={ closeIcon }
						label={ __( 'Remove Image', 'lunar-blocks' ) }
						onClick={ onRemoveImage }
					/>
				</ToolbarGroup>
			</BlockControls>
			<figure { ...blockProps }>
				<img
					className="lunar-gallery-item__image"
					src={ imageUrl }
					alt={ imageAlt }
				/>
				{ ( isSelected || caption ) && (
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