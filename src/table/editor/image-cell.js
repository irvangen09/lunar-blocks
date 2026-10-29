import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, TextControl } from '@wordpress/components';

export default function ImageCell( {
	image,
	width,
	onSelect,
	onRemove,
	onAlt,
	onFocus,
} ) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ onSelect }
				allowedTypes={ [ 'image' ] }
				value={ image?.id }
				render={ ( { open } ) => (
					// Focus bubbles up from the controls inside.

					<div onFocus={ onFocus }>
						{ image?.url ? (
							<div className="lunar-table-editor__image-cell">
								<img
									src={ image.url }
									alt=""
									style={ { width: width + 'px' } }
								/>
								<TextControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Alt text', 'lunar-blocks' ) }
									hideLabelFromVision
									placeholder={ __(
										'Describe this image…',
										'lunar-blocks'
									) }
									value={ image.alt || '' }
									onChange={ onAlt }
								/>
								<Button
									variant="link"
									size="small"
									onClick={ open }
								>
									{ __( 'Replace', 'lunar-blocks' ) }
								</Button>
								<Button
									variant="link"
									size="small"
									isDestructive
									onClick={ onRemove }
								>
									{ __( 'Remove image', 'lunar-blocks' ) }
								</Button>
							</div>
						) : (
							<div className="lunar-table-editor__image-empty">
								<Button
									variant="secondary"
									size="small"
									onClick={ open }
								>
									{ __( 'Choose image', 'lunar-blocks' ) }
								</Button>
								<TextControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Image URL', 'lunar-blocks' ) }
									hideLabelFromVision
									placeholder={ __(
										'or paste image URL…',
										'lunar-blocks'
									) }
									onKeyDown={ ( event ) => {
										if ( 'Enter' !== event.key ) {
											return;
										}

										event.preventDefault();

										const url = event.target.value.trim();

										if ( url ) {
											onSelect( { id: 0, url, alt: '' } );
										}
									} }
								/>
							</div>
						) }
					</div>
				) }
			/>
		</MediaUploadCheck>
	);
}
