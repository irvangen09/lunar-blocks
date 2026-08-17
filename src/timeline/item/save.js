import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { label, title, description } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'lunar-timeline-item',
	} );

	const hasLabel = ! RichText.isEmpty( label );
	const hasDescription = ! RichText.isEmpty( description );

	return (
		<li { ...blockProps }>
			{ hasLabel && (
				<RichText.Content
					tagName="span"
					className="lunar-timeline-item__label"
					value={ label }
				/>
			) }
			<RichText.Content
				tagName="h3"
				className="lunar-timeline-item__title"
				value={ title }
			/>
			{ hasDescription && (
				<RichText.Content
					tagName="div"
					className="lunar-timeline-item__description"
					value={ description }
				/>
			) }
		</li>
	);
}
