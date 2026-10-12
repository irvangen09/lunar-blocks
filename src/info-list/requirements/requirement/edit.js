import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import IconControl from '../../../shared/icon-control';
import { ICON_PATTERN } from '../../../shared/icon';
import metadata from './block.json';

const TEXT_FORMATS = [ 'core/bold', 'core/italic', 'core/link' ];

// The placeholder follows the schema default, so the icon is named in one place.
const DEFAULT_ICON = metadata.attributes.icon.default;

export default function Edit( { attributes, setAttributes } ) {
	const { icon, text } = attributes;

	const blockProps = useBlockProps( {
		className: 'moon-info-list-requirement',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Requirement Settings', 'moon-blocks' ) }
				>
					<IconControl
						value={ icon }
						placeholder={ DEFAULT_ICON }
						onChange={ ( newIcon ) =>
							setAttributes( { icon: newIcon } )
						}
						help={ __(
							'Dashicons class name. Leave empty if this item does not need an icon.',
							'moon-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ ICON_PATTERN.test( icon ) && (
					<span
						className={ `moon-info-list-requirement__icon dashicons ${ icon }` }
						aria-hidden="true"
					/>
				) }
				<RichText
					tagName="span"
					className="moon-info-list-requirement__text"
					placeholder={ __( 'Requirement…', 'moon-blocks' ) }
					value={ text }
					onChange={ ( newText ) =>
						setAttributes( { text: newText } )
					}
					allowedFormats={ TEXT_FORMATS }
					disableLineBreaks
				/>
			</div>
		</>
	);
}
