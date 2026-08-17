import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { variant, content } = attributes;

	const blockProps = useBlockProps.save( {
		className: `lunar-callout lunar-callout--${ variant }`,
	} );

	return (
		<div { ...blockProps }>
			<RichText.Content
				tagName="div"
				className="lunar-callout__text"
				value={ content }
			/>
		</div>
	);
}
