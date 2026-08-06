import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const { term, definition } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-definition-item',
	} );

	return (
		<div { ...blockProps }>
			<RichText
				tagName="dt"
				className="lunar-definition-item__term"
				placeholder={ __( 'Term…', 'lunar-blocks' ) }
				value={ term }
				onChange={ ( value ) => setAttributes( { term: value } ) }
				allowedFormats={ [ 'core/bold', 'core/italic' ] }
			/>
			<RichText
				tagName="dd"
				className="lunar-definition-item__definition"
				placeholder={ __( 'Definition…', 'lunar-blocks' ) }
				value={ definition }
				onChange={ ( value ) => setAttributes( { definition: value } ) }
			/>
		</div>
	);
}