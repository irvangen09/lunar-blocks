import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	InnerBlocks,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption } from '@wordpress/components';

const ALLOWED_BLOCKS = [ 'lunar-blocks/gallery-item' ];

const GALLERY_ITEM_TEMPLATE = [
	[ 'lunar-blocks/gallery-item' ],
	[ 'lunar-blocks/gallery-item' ],
	[ 'lunar-blocks/gallery-item' ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { columns } = attributes;

	const blockProps = useBlockProps( {
		className: `lunar-gallery lunar-gallery--columns-${ columns }`,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: GALLERY_ITEM_TEMPLATE,
		orientation: 'horizontal',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Gallery Settings', 'lunar-blocks' ) }>
					<ToggleGroupControl
						label={ __( 'Number of Columns', 'lunar-blocks' ) }
						value={ columns }
						isBlock
						onChange={ ( value ) =>
							setAttributes( { columns: Number( value ) } )
						}
					>
						<ToggleGroupControlOption value={ 2 } label="2" />
						<ToggleGroupControlOption value={ 3 } label="3" />
						<ToggleGroupControlOption value={ 4 } label="4" />
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}