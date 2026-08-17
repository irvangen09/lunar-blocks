import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { title, headingLevel, icon } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'lunar-accordion-item',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'lunar-accordion-item__content',
	} );

	// The "open" attribute is intentionally omitted here — it defaults to
	// closed, and view.js corrects the state on load based on screen width.
	//
	// Fallback tag is "span" (not "p" like in Infobox) because this element
	// sits inside <summary>, and the HTML spec restricts <summary> content
	// to phrasing content or a single heading element.
	const titleTagName = 'none' === headingLevel ? 'span' : headingLevel;
	const iconClassName =
		icon && icon.startsWith( 'dashicons-' ) ? `dashicons ${ icon }` : icon;

	return (
		<details { ...blockProps }>
			<summary className="lunar-accordion-item__summary">
				{ icon && (
					<span
						className={ `lunar-accordion-item__icon ${ iconClassName }` }
						aria-hidden="true"
					/>
				) }
				<RichText.Content
					tagName={ titleTagName }
					className="lunar-accordion-item__title"
					value={ title }
				/>
			</summary>

			<div { ...innerBlocksProps } />
		</details>
	);
}
