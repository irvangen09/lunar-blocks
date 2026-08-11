import {
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'lunar-blocks/timeline-item' ];

const TEMPLATE = [
	[ 'lunar-blocks/timeline-item' ],
	[ 'lunar-blocks/timeline-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'lunar-timeline',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
		renderAppender: useInnerBlocksProps.DefaultBlockAppender,
	} );

	return <ol { ...innerBlocksProps } />;
}