import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { imageId, imageUrl, imageAlt, caption } = attributes;

	// An item without an image has nothing to show.
	if ( ! imageUrl ) {
		return null;
	}

	const blockProps = useBlockProps.save( {
		className: 'moon-gallery-item',
	} );

	// The wp-image class lets WordPress add srcset and dimensions when rendering.
	const imageClassName =
		imageId > 0
			? `moon-gallery-item__image wp-image-${ imageId }`
			: 'moon-gallery-item__image';

	return (
		<figure { ...blockProps }>
			<a className="moon-gallery-item__link" href={ imageUrl }>
				<img
					className={ imageClassName }
					src={ imageUrl }
					alt={ imageAlt }
				/>
			</a>
			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content
					tagName="figcaption"
					className="moon-gallery-item__caption"
					value={ caption }
				/>
			) }
		</figure>
	);
}
