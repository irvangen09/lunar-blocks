import { useBlockProps, useInnerBlocksProps, InnerBlocks } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'lunar-blocks/tabs-item' ];

const TEMPLATE = [
	[ 'lunar-blocks/tabs-item' ],
	[ 'lunar-blocks/tabs-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'lunar-tabs',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
		orientation: 'horizontal',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <div { ...innerBlocksProps } />;
}