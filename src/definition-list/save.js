import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( {
		className: 'lunar-definition-list',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <dl { ...innerBlocksProps } />;
}