import { useBlockProps, useInnerBlocksProps, InnerBlocks } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'lunar-blocks/accordion-item' ];

const TEMPLATE = [
	[ 'lunar-blocks/accordion-item' ],
	[ 'lunar-blocks/accordion-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'lunar-accordion',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <div { ...innerBlocksProps } />;
}