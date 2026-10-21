import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { variant, content, label, variantName } = attributes;
	const blockProps = useBlockProps.save( {
		className: `moon-callout moon-callout--${ variant }`,
		role: 'note',

		// Without a visible label the variant name is the only name the
		// note has.
		'aria-label': label ? undefined : variantName || undefined,
	} );

	return (
		<div { ...blockProps }>
			<span className="moon-callout__icon" aria-hidden="true" />
			<div className="moon-callout__body">
				{ label && <p className="moon-callout__label">{ label }</p> }
				<RichText.Content
					tagName="div"
					className="moon-callout__text"
					value={ content }
				/>
			</div>
		</div>
	);
}
