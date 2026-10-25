import metadata from './block.json';
import save from './deprecated/save-v1';

const OPEN_CLASS = 'moon-accordion--open-desktop';

const v1 = {
	attributes: {
		...metadata.attributes,
		openOnDesktop: {
			type: 'boolean',
			default: true,
		},
	},
	supports: metadata.supports,
	// The first argument holds only what the block comment says; the custom
	// class name is found on the parsed block.
	isEligible( attributes, innerBlocks, { block } = {} ) {
		const className = block?.attributes?.className ?? attributes.className;

		return (
			'string' === typeof className &&
			className.split( /\s+/ ).includes( OPEN_CLASS )
		);
	},
	save,
};

export default [ v1 ];
