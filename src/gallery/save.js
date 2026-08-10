import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { columns } = attributes;

	const blockProps = useBlockProps.save( {
		className: `lunar-gallery lunar-gallery--columns-${ columns }`,
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}