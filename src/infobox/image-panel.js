import { __ } from '@wordpress/i18n';
import { Button, PanelBody, TextControl } from '@wordpress/components';

export default function ImagePanel( {
	imageAlt,
	setAttributes,
	onRemoveImage,
} ) {
	return (
		<PanelBody title={ __( 'Image', 'lunar-blocks' ) }>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Alternative text', 'lunar-blocks' ) }
				value={ imageAlt }
				onChange={ ( value ) => setAttributes( { imageAlt: value } ) }
				help={ __(
					'Describe the image for people who cannot see it. Leave empty if the image is only decoration.',
					'lunar-blocks'
				) }
			/>
			<Button variant="secondary" isDestructive onClick={ onRemoveImage }>
				{ __( 'Remove image', 'lunar-blocks' ) }
			</Button>
		</PanelBody>
	);
}
