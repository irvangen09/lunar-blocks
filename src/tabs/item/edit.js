import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';

const CONTENT_TEMPLATE = [ [ 'core/paragraph' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { label } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-tabs-item',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'lunar-tabs-item__content' },
		{ template: CONTENT_TEMPLATE }
	);

	return (
		<div { ...blockProps }>
			<RichText
				tagName="div"
				className="lunar-tabs-item__label"
				placeholder={ __( 'Tab label…', 'lunar-blocks' ) }
				value={ label }
				onChange={ ( value ) => setAttributes( { label: value } ) }
				allowedFormats={ [] }
			/>

			<div { ...innerBlocksProps } />
		</div>
	);
}