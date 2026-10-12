import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [
	'moon-blocks/info-list-item',
	'moon-blocks/info-list-requirements',
];

const TEMPLATE = [
	[ 'moon-blocks/info-list-item' ],
	[ 'moon-blocks/info-list-item' ],
	[ 'moon-blocks/info-list-item' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'moon-info-list',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <div { ...innerBlocksProps } />;
}
