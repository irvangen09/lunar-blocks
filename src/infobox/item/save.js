import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { mode, label, fieldSourceId, fieldSourceLabel, value } = attributes;

	// A field with no value renders no markup at all.
	if ( RichText.isEmpty( value ) ) {
		return null;
	}

	const isLinked = mode === 'linked';
	const displayLabel = isLinked ? fieldSourceLabel : label;

	const dtProps = useBlockProps.save( {
		className: isLinked
			? 'lunar-infobox-item__label lunar-infobox-item__label--linked'
			: 'lunar-infobox-item__label',
		'data-mode': mode,
		...( isLinked && fieldSourceId ? { 'data-field-source': fieldSourceId } : {} ),
	} );

	return (
		<>
			<dt { ...dtProps }>{ displayLabel }</dt>
			<RichText.Content tagName="dd" className="lunar-infobox-item__value" value={ value } />
		</>
	);
}