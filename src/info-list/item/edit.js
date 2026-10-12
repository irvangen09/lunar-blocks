import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import IconControl from '../../shared/icon-control';
import { ICON_PATTERN } from '../../shared/icon';

const VALUE_FORMATS = [ 'core/bold', 'core/italic', 'core/link' ];

export default function Edit( { attributes, setAttributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps( {
		className: 'moon-info-list-item',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings', 'moon-blocks' ) }>
					<IconControl
						value={ icon }
						placeholder="dashicons-calendar-alt"
						onChange={ ( newIcon ) =>
							setAttributes( { icon: newIcon } )
						}
						help={ __(
							'Dashicons class name. Leave empty if this field does not need an icon. Icons show on desktop only.',
							'moon-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="moon-info-list-item__label">
					{ ICON_PATTERN.test( icon ) && (
						<span
							className={ `moon-info-list-item__icon dashicons ${ icon }` }
							aria-hidden="true"
						/>
					) }
					<RichText
						tagName="span"
						className="moon-info-list-item__label-text"
						placeholder={ __( 'Label', 'moon-blocks' ) }
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
					className="moon-info-list-item__value"
					placeholder={ __( 'Value', 'moon-blocks' ) }
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
