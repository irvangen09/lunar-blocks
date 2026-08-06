import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

const VARIANT_OPTIONS = [
	{ label: __( 'Info', 'lunar-blocks' ), value: 'info' },
	{ label: __( 'Tips', 'lunar-blocks' ), value: 'tips' },
	{ label: __( 'Warning', 'lunar-blocks' ), value: 'warning' },
	{ label: __( 'Important', 'lunar-blocks' ), value: 'important' },
];

export default function Edit( { attributes, setAttributes } ) {
	const { variant, content } = attributes;

	const blockProps = useBlockProps( {
		className: `lunar-callout lunar-callout--${ variant }`,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Callout Settings', 'lunar-blocks' ) }>
					<SelectControl
						label={ __( 'Callout Type', 'lunar-blocks' ) }
						value={ variant }
						options={ VARIANT_OPTIONS }
						onChange={ ( value ) => setAttributes( { variant: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<RichText
					tagName="div"
					className="lunar-callout__text"
					placeholder={ __( 'Write your note here…', 'lunar-blocks' ) }
					value={ content }
					onChange={ ( value ) => setAttributes( { content: value } ) }
				/>
			</div>
		</>
	);
}