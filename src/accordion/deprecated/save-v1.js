import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { openOnDesktop } = attributes;

	const blockProps = useBlockProps.save( {
		className: openOnDesktop
			? 'lunar-accordion lunar-accordion--open-desktop'
			: 'lunar-accordion',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}
