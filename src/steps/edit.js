import { useBlockProps, useInnerBlocksProps, InnerBlocks } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'lunar-blocks/steps-item' ];

const TEMPLATE = [
	[ 'lunar-blocks/steps-item' ],
	[ 'lunar-blocks/steps-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'lunar-steps',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <ol { ...innerBlocksProps } />;
}