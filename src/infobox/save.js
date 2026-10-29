import {
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { title, headingLevel, imageId, imageUrl, imageAlt } = attributes;

	const hasImage = '' !== imageUrl;

	const blockProps = useBlockProps.save( {
		className: hasImage
			? 'lunar-infobox'
			: 'lunar-infobox lunar-infobox--no-image',
	} );

	const rowsProps = useInnerBlocksProps.save( {
		className: 'lunar-infobox__rows',
	} );

	// A paragraph keeps the title out of the page outline unless a level is chosen.
	const titleTagName = 'none' === headingLevel ? 'p' : headingLevel;

	// The wp-image class lets WordPress add srcset and dimensions when rendering.
	const imageClassName =
		imageId > 0
			? `lunar-infobox__image wp-image-${ imageId }`
			: 'lunar-infobox__image';

	return (
		<div { ...blockProps }>
			{ hasImage && (
				<figure className="lunar-infobox__media">
					<img
						className={ imageClassName }
						src={ imageUrl }
						alt={ imageAlt }
					/>
				</figure>
			) }
			<div className="lunar-infobox__body">
				{ ! RichText.isEmpty( title ) && (
					<RichText.Content
						tagName={ titleTagName }
						className="lunar-infobox__title"
						value={ title }
					/>
				) }
				<dl { ...rowsProps } />
			</div>
		</div>
	);
}
