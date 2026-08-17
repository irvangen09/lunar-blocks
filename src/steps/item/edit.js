import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const CONTENT_TEMPLATE = [ [ 'core/paragraph' ] ];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'lunar-steps-item',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: CONTENT_TEMPLATE,
	} );

	return <li { ...innerBlocksProps } />;
}
