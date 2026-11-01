import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';

export default function Media( {
	imageId,
	imageUrl,
	imageAlt,
	onSelectImage,
} ) {
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
