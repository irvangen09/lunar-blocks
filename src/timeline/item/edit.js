import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const { label, title, description } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-timeline-item',
	} );

	return (
		<li { ...blockProps }>
			<RichText
				tagName="span"
				className="lunar-timeline-item__label"
				value={ label }
				onChange={ ( value ) => setAttributes( { label: value } ) }
				placeholder={ __(
					'Label (optional — e.g. date, version, or a free-form marker)',
					'lunar-blocks'
				) }
				allowedFormats={ [] }
			/>
			<RichText
				tagName="h3"
				className="lunar-timeline-item__title"
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
				placeholder={ __( 'Title', 'lunar-blocks' ) }
				allowedFormats={ [ 'core/bold', 'core/italic' ] }
			/>
			<RichText
				tagName="div"
				className="lunar-timeline-item__description"
				value={ description }
				onChange={ ( value ) =>
					setAttributes( { description: value } )
				}
				placeholder={ __( 'Description (optional)', 'lunar-blocks' ) }
				allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
				multiline="p"
			/>
		</li>
	);
}
