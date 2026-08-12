import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	RichText,
	MediaUpload,
	MediaUploadCheck,
	InspectorControls,
} from '@wordpress/block-editor';
import { Button, PanelBody, SelectControl, TextControl } from '@wordpress/components';

const ALLOWED_BLOCKS = [ 'lunar-blocks/infobox-item' ];

const TEMPLATE = [
	[ 'lunar-blocks/infobox-item' ],
	[ 'lunar-blocks/infobox-item' ],
	[ 'lunar-blocks/infobox-item' ],
];

const HEADING_LEVEL_OPTIONS = [
	{ label: __( 'No Heading (plain paragraph)', 'lunar-blocks' ), value: 'none' },
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
];

export default function Edit( { attributes, setAttributes } ) {
	const { name, headingLevel, icon, imageId, imageUrl, imageAlt } = attributes;

	const blockProps = useBlockProps( {
		className: 'lunar-infobox',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'lunar-infobox__fields' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	function onSelectImage( media ) {
		setAttributes( {
			imageId: media.id,
			imageUrl: media.url,
			imageAlt: media.alt || '',
		} );
	}

	function onRemoveImage() {
		setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } );
	}

	const nameTagName = 'none' === headingLevel ? 'p' : headingLevel;

	// Dashicons need both the base "dashicons" class and the specific one (e.g.
	// "dashicons-admin-users") for the icon font to actually render — without the
	// base class, the browser shows an empty box ("tofu") since it doesn't know
	// which font to use. Detected automatically so the author only has to type
	// the dashicon name itself.
	const iconClassName = icon && icon.startsWith( 'dashicons-' ) ? `dashicons ${ icon }` : icon;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Infobox Title Settings', 'lunar-blocks' ) }>
					<SelectControl
						label={ __( 'Heading Level', 'lunar-blocks' ) }
						value={ headingLevel }
						options={ HEADING_LEVEL_OPTIONS }
						onChange={ ( value ) => setAttributes( { headingLevel: value } ) }
						help={ __(
							'Choose "No Heading" if this infobox title shouldn\'t appear as an entry in the Table of Contents.',
							'lunar-blocks'
						) }
					/>
					<TextControl
						label={ __( 'Icon (optional)', 'lunar-blocks' ) }
						value={ icon }
						onChange={ ( value ) => setAttributes( { icon: value } ) }
						placeholder={ __( 'e.g. dashicons-admin-users, fa fa-user', 'lunar-blocks' ) }
						help={ __(
							"Enter an icon class name (WordPress's built-in dashicons, or another library like Font Awesome if the theme already loads it). Can be left empty.",
							'lunar-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className="lunar-infobox__media">
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectImage }
							allowedTypes={ [ 'image' ] }
							value={ imageId }
							render={ ( { open } ) =>
								imageUrl ? (
									<div className="lunar-infobox__media-preview">
										<img src={ imageUrl } alt={ imageAlt } />
										<Button variant="secondary" onClick={ open }>
											{ __( 'Change Image', 'lunar-blocks' ) }
										</Button>
										<Button variant="tertiary" isDestructive onClick={ onRemoveImage }>
											{ __( 'Remove Image', 'lunar-blocks' ) }
										</Button>
									</div>
								) : (
									<Button variant="secondary" onClick={ open }>
										{ __( 'Select Image', 'lunar-blocks' ) }
									</Button>
								)
							}
						/>
					</MediaUploadCheck>
				</div>
				<div className="lunar-infobox__header">
					{ icon && <span className={ `lunar-infobox__icon ${ iconClassName }` } aria-hidden="true" /> }
					<RichText
						tagName={ nameTagName }
						className="lunar-infobox__name"
						placeholder={ __( 'Infobox title (e.g. Basic Information, or character name)', 'lunar-blocks' ) }
						value={ name }
						onChange={ ( value ) => setAttributes( { name: value } ) }
						allowedFormats={ [] }
					/>
				</div>
				<dl { ...innerBlocksProps } />
			</div>
		</>
	);
}