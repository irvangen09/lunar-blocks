import metadata from './block.json';
import save from './deprecated/save-v1';
import { isCardPreset, isRecipePreset } from './utils';

// Before sorting reached the card layouts, enableSort had no effect on them
// and was stored as true by default. A card layout saved that way must not
// start to sort when it is opened, so the migration turns it off.
const v1 = {
	attributes: metadata.attributes,
	supports: metadata.supports,
	save,
	migrate( attributes ) {
		const { preset } = attributes;

		if ( isCardPreset( preset ) || isRecipePreset( preset ) ) {
			return { ...attributes, enableSort: false };
		}

		return attributes;
	},
};

export default [ v1 ];
