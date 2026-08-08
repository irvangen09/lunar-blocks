import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { label } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'lunar-tabs-item',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'lunar-tabs-item__content',
	} );

	// Rendered as a plain <div>, not a <button> — without JS this is just a
	// section marker, not a control that actually does anything yet. view.js
	// upgrades it into a real interactive tab control at runtime.
	return (
		<div { ...blockProps }>
			<RichText.Content tagName="div" className="lunar-tabs-item__label" value={ label } />
			<div { ...innerBlocksProps } />
		</div>
	);
}