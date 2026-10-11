import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	ExternalLink,
	Notice,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { ICON_PATTERN } from './save';

const VALUE_FORMATS = [ 'core/bold', 'core/italic', 'core/link' ];

export default function Edit( { attributes, setAttributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps( {
		className: 'moon-infobox-item',
	} );

	// The field keeps what was typed, while only valid names reach the attribute.
	const [ iconDraft, setIconDraft ] = useState( icon );

	// Follows changes made elsewhere, such as undo.
	useEffect( () => {
		setIconDraft( icon );
	}, [ icon ] );

	const iconName = iconDraft.trim().toLowerCase();
	const isIconInvalid = '' !== iconName && ! ICON_PATTERN.test( iconName );

	const onIconChange = ( newValue ) => {
		setIconDraft( newValue );

		const newName = newValue.trim().toLowerCase();

		if ( '' === newName || ICON_PATTERN.test( newName ) ) {
			setAttributes( { icon: newName } );
		}
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings', 'moon-blocks' ) }>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Icon', 'moon-blocks' ) }
						value={ iconDraft }
						placeholder="dashicons-calendar-alt"
						onChange={ onIconChange }
						help={
							<>
								{ __(
									'Dashicons class name. Leave empty if this field does not need an icon. Icons show on desktop only.',
									'moon-blocks'
								) }{ ' ' }
								<ExternalLink href="https://developer.wordpress.org/resource/dashicons/">
									{ __( 'Browse Dashicons', 'moon-blocks' ) }
								</ExternalLink>
							</>
						}
					/>
					{ isIconInvalid && (
						<Notice status="error" isDismissible={ false }>
							{ __(
								'This icon name is not saved. Use a name that starts with "dashicons-", such as dashicons-calendar-alt.',
								'moon-blocks'
							) }
						</Notice>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="moon-infobox-item__label">
					{ ICON_PATTERN.test( icon ) && (
						<span
							className={ `moon-infobox-item__icon dashicons ${ icon }` }
							aria-hidden="true"
						/>
					) }
					<RichText
						tagName="span"
						className="moon-infobox-item__label-text"
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
					className="moon-infobox-item__value"
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
