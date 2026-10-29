import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { getHeadingOptions } from '../../shared/heading-options';

const CONTENT_TEMPLATE = [ [ 'core/paragraph' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { title, headingLevel } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-accordion-item',
	} );

	// Content stays expanded in the editor so writing is not interrupted.
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'lunar-accordion-item__content' },
		{ template: CONTENT_TEMPLATE }
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Title Settings', 'lunar-blocks' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Heading Level', 'lunar-blocks' ) }
						value={ headingLevel }
						options={ getHeadingOptions() }
						onChange={ ( value ) =>
							setAttributes( { headingLevel: value } )
						}
						help={ __(
							'The heading level shapes the heading structure of the page. Choose a level that fits the surrounding content.',
							'lunar-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="lunar-accordion-item__header">
					<RichText
						tagName={ 'none' === headingLevel ? 'p' : headingLevel }
						className="lunar-accordion-item__title"
						placeholder={ __( 'Section title…', 'lunar-blocks' ) }
						value={ title }
						onChange={ ( value ) =>
							setAttributes( { title: value } )
						}
						allowedFormats={ [] }
					/>
				</div>

				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
