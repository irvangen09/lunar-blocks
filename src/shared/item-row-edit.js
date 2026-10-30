import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import IconControl from './icon-control';
import { ICON_PATTERN } from './icon';

const VALUE_FORMATS = [ 'core/bold', 'core/italic', 'core/link' ];

// Editor for a row made of an optional icon, a label and a value. The class
// names are built from the block's own class.
export default function ItemRowEdit( {
	attributes,
	setAttributes,
	blockClass,
} ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps( {
		className: blockClass,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings', 'lunar-blocks' ) }>
					<IconControl
						value={ icon }
						placeholder="dashicons-calendar-alt"
						onChange={ ( newIcon ) =>
							setAttributes( { icon: newIcon } )
						}
						help={ __(
							'Dashicons class name. Leave empty if this field does not need an icon. Icons show on desktop only.',
							'lunar-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className={ `${ blockClass }__label` }>
					{ ICON_PATTERN.test( icon ) && (
						<span
							className={ `${ blockClass }__icon dashicons ${ icon }` }
							aria-hidden="true"
						/>
					) }
					<RichText
						tagName="span"
						className={ `${ blockClass }__label-text` }
						placeholder={ __( 'Label', 'lunar-blocks' ) }
						value={ label }
						onChange={ ( newLabel ) =>
							setAttributes( { label: newLabel } )
						}
						allowedFormats={ [] }
						disableLineBreaks
					/>
				</div>

				<RichText
					tagName="div"
					className={ `${ blockClass }__value` }
					placeholder={ __( 'Value', 'lunar-blocks' ) }
					value={ value }
					onChange={ ( newValue ) =>
						setAttributes( { value: newValue } )
					}
					allowedFormats={ VALUE_FORMATS }
				/>
			</div>
		</>
	);
}
