import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import itemMetadata from './item/block.json';

const ALLOWED_BLOCKS = [ itemMetadata.name ];

const TEMPLATE = [ [ itemMetadata.name ], [ itemMetadata.name ] ];

// The editor stacks every item instead of switching tabs, so the default
// vertical orientation matches what the writer sees.
export default function Edit() {
	const blockProps = useBlockProps( { className: 'lunar-tabs' } );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <div { ...innerBlocksProps } />;
}
