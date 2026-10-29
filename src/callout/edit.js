import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	PlainText,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';

// Called at render time so translations are loaded.
function getVariants() {
	return [
		{ value: 'info', label: __( 'Info', 'lunar-blocks' ) },
		{ value: 'tips', label: __( 'Tips', 'lunar-blocks' ) },
		{ value: 'warning', label: __( 'Warning', 'lunar-blocks' ) },
		{ value: 'important', label: __( 'Important', 'lunar-blocks' ) },
	];
}

function getVariantName( value ) {
	const match = getVariants().find( ( variant ) => variant.value === value );

	return match ? match.label : '';
}

export default function Edit( { attributes, setAttributes } ) {
	const { variant, content, label, variantName } = attributes;
	const blockProps = useBlockProps( {
		className: `lunar-callout lunar-callout--${ variant }`,
	} );

	// New blocks have no label and empty content (an empty RichTextData, not
	// undefined). Requiring empty content keeps a cleared label cleared when
	// a saved block is reloaded, since an empty label is not stored.
	const isContentEmpty = ! content?.toString();

	useEffect( () => {
		if ( undefined === label && isContentEmpty ) {
			setAttributes( { label: getVariantName( variant ) } );
		}

		if ( undefined === variantName ) {
			setAttributes( { variantName: getVariantName( variant ) } );
		}
	}, [ label, isContentEmpty, variant, variantName, setAttributes ] );

	function onVariantChange( next ) {
		const isDefaultLabel = label === getVariantName( variant );

		setAttributes( {
			variant: next,
			variantName: getVariantName( next ),
			label: isDefaultLabel ? getVariantName( next ) : label,
		} );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'lunar-blocks' ) }>
					<SelectControl
						label={ __( 'Variant', 'lunar-blocks' ) }
						value={ variant }
						options={ getVariants() }
						onChange={ onVariantChange }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<span className="lunar-callout__icon" aria-hidden="true" />
				<div className="lunar-callout__body">
					<PlainText
						className="lunar-callout__label"
						value={ label || '' }
						onChange={ ( value ) =>
							setAttributes( { label: value } )
						}
						onKeyDown={ ( event ) => {
							if ( 'Enter' === event.key ) {
								event.preventDefault();
							}
						} }
						placeholder={ __( 'Label (optional)', 'lunar-blocks' ) }
						aria-label={ __( 'Label', 'lunar-blocks' ) }
					/>
					<RichText
						tagName="div"
						className="lunar-callout__text"
						value={ content }
						onChange={ ( value ) =>
							setAttributes( { content: value } )
						}
						placeholder={ __( 'Write your note…', 'lunar-blocks' ) }
					/>
				</div>
			</div>
		</>
	);
}
