import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [
	'lunar-blocks/info-list-item',
	'lunar-blocks/info-list-requirements',
];

const TEMPLATE = [
	[ 'lunar-blocks/info-list-item' ],
	[ 'lunar-blocks/info-list-item' ],
	[ 'lunar-blocks/info-list-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'lunar-info-list',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <div { ...innerBlocksProps } />;
}
