import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( {
		className: 'lunar-steps-item',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <li { ...innerBlocksProps } />;
}