import metadata from './block.json';
import save from './deprecated/save-v1';
import saveV2 from './deprecated/save-v2';
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

// Up to 2.1.1 a Preset 1 header with no column alignment was written with an
// inline `text-align: center`. Nothing in the data changes: the table is
// written again with the current markup when it is opened and updated.
const v2 = {
	attributes: metadata.attributes,
	supports: metadata.supports,
	save: saveV2,
};

export default [ v2, v1 ];
