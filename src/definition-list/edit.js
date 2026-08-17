import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'lunar-blocks/definition-item' ];

const TEMPLATE = [
	[ 'lunar-blocks/definition-item' ],
	[ 'lunar-blocks/definition-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'lunar-definition-list',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <dl { ...innerBlocksProps } />;
}
