import {
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { getTitleTagName } from '../../shared/heading-options';

export default function save( { attributes } ) {
	const { title, headingLevel } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'lunar-accordion-item',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'lunar-accordion-item__content',
	} );

	// <summary> only allows phrasing content or one heading, so no <p> here.
	const titleTagName = getTitleTagName( headingLevel, 'span' );

	return (
		<details { ...blockProps }>
			<summary className="lunar-accordion-item__summary">
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
