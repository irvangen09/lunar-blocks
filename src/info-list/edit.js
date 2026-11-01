import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

import itemMetadata from './item/block.json';
import requirementsMetadata from './requirements/block.json';

const ALLOWED_BLOCKS = [ itemMetadata.name, requirementsMetadata.name ];

const TEMPLATE = [
	[ itemMetadata.name ],
	[ itemMetadata.name ],
	[ itemMetadata.name ],
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
