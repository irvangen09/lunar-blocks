import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { variant, content, label, variantName } = attributes;
	const blockProps = useBlockProps.save( {
		className: `lunar-callout lunar-callout--${ variant }`,
		role: 'note',

		// Without a visible label the variant name is the only name the
		// note has.
		'aria-label': label ? undefined : variantName || undefined,
	} );

	return (
		<div { ...blockProps }>
			<span className="lunar-callout__icon" aria-hidden="true" />
			<div className="lunar-callout__body">
				{ label && <p className="lunar-callout__label">{ label }</p> }
				<RichText.Content
					tagName="div"
					className="lunar-callout__text"
					value={ content }
				/>
			</div>
		</div>
	);
}
