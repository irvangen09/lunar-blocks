import { __ } from '@wordpress/i18n';
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';

const ALLOWED_BLOCKS = [ 'moon-blocks/gallery-item' ];

const TEMPLATE = [
	[ 'moon-blocks/gallery-item' ],
	[ 'moon-blocks/gallery-item' ],
	[ 'moon-blocks/gallery-item' ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { columns } = attributes;

	const blockProps = useBlockProps( {
		className: `moon-gallery moon-gallery--columns-${ columns }`,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		orientation: 'horizontal',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Gallery Settings', 'moon-blocks' ) }>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Columns', 'moon-blocks' ) }
						help={ __(
							'Number of columns on wide screens. Small screens always show two.',
							'moon-blocks'
						) }
						value={ columns }
						min={ 2 }
						max={ 4 }
						step={ 1 }
						onChange={ ( value ) => {
							if ( value ) {
								setAttributes( { columns: value } );
							}
						} }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}
