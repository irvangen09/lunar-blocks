import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( {
		className: 'lunar-info-list',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <dl { ...innerBlocksProps } />;
}
