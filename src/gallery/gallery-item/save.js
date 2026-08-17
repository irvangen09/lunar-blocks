import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { imageUrl, imageAlt, caption } = attributes;

	if ( ! imageUrl ) {
		return null;
	}

	const blockProps = useBlockProps.save( {
		className: 'lunar-gallery-item',
	} );

	const hasCaption = ! RichText.isEmpty( caption );

	return (
		<figure { ...blockProps }>
			<a
				className="lunar-gallery-item__link"
				href={ imageUrl }
				data-lunar-lightbox="gallery-item"
			>
				<img
					className="lunar-gallery-item__image"
					src={ imageUrl }
					alt={ imageAlt }
				/>
			</a>
			{ hasCaption && (
				<RichText.Content
					tagName="figcaption"
					className="lunar-gallery-item__caption"
					value={ caption }
				/>
			) }
		</figure>
	);
}
