import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

const HEADING_LEVEL_OPTIONS = [
	{ label: __( 'No Heading (plain paragraph)', 'lunar-blocks' ), value: 'none' },
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
];

const CONTENT_TEMPLATE = [ [ 'core/paragraph' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { title, headingLevel, icon } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-accordion-item',
	} );

	// Content is always shown expanded in the editor (no <details> here,
	// unlike save.js) so writing isn't interrupted by open/close behavior.
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'lunar-accordion-item__content' },
		{ template: CONTENT_TEMPLATE }
	);

	const titleTagName = 'none' === headingLevel ? 'p' : headingLevel;
	const iconClassName = icon && icon.startsWith( 'dashicons-' ) ? `dashicons ${ icon }` : icon;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Title Settings', 'lunar-blocks' ) }>
					<SelectControl
						label={ __( 'Heading Level', 'lunar-blocks' ) }
						value={ headingLevel }
						options={ HEADING_LEVEL_OPTIONS }
						onChange={ ( value ) => setAttributes( { headingLevel: value } ) }
						help={ __(
							'This section title will be picked up by the Table of Contents (unlike the Infobox title, which is purely decorative).',
							'lunar-blocks'
						) }
					/>
					<TextControl
						label={ __( 'Icon (optional)', 'lunar-blocks' ) }
						value={ icon }
						onChange={ ( value ) => setAttributes( { icon: value } ) }
						placeholder={ __( 'e.g. dashicons-clock', 'lunar-blocks' ) }
						help={ __( 'Optional.', 'lunar-blocks' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="lunar-accordion-item__header">
					{ icon && (
						<span className={ `lunar-accordion-item__icon ${ iconClassName }` } aria-hidden="true" />
					) }
					<RichText
						tagName={ titleTagName }
						className="lunar-accordion-item__title"
						placeholder={ __( 'Section title…', 'lunar-blocks' ) }
						value={ title }
						onChange={ ( value ) => setAttributes( { title: value } ) }
						allowedFormats={ [] }
					/>
				</div>

				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}