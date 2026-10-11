import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ExternalLink, Notice, TextControl } from '@wordpress/components';
import { ICON_PATTERN } from './icon';

export default function IconControl( { value, onChange, placeholder, help } ) {
	// The field keeps what was typed, while only valid names reach onChange.
	const [ draft, setDraft ] = useState( value );

	// Follows changes made elsewhere, such as undo.
	useEffect( () => {
		setDraft( value );
	}, [ value ] );

	const name = draft.trim().toLowerCase();
	const isInvalid = '' !== name && ! ICON_PATTERN.test( name );

	const handleChange = ( newValue ) => {
		setDraft( newValue );

		const newName = newValue.trim().toLowerCase();

		if ( '' === newName || ICON_PATTERN.test( newName ) ) {
			onChange( newName );
		}
	};

	return (
		<>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Icon', 'moon-blocks' ) }
				value={ draft }
				placeholder={ placeholder }
				onChange={ handleChange }
				help={
					<>
						{ help }{ ' ' }
						<ExternalLink href="https://developer.wordpress.org/resource/dashicons/">
							{ __( 'Browse Dashicons', 'moon-blocks' ) }
						</ExternalLink>
					</>
				}
			/>
			{ isInvalid && (
				<Notice status="error" isDismissible={ false }>
					{ __(
						'This icon name is not saved. Use a name that starts with "dashicons-", such as dashicons-calendar-alt.',
						'moon-blocks'
					) }
				</Notice>
			) }
		</>
	);
}
